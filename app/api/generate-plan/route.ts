import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NutritionPlan } from "../../_lib/types";

const SYSTEM_PROMPT = `Tu es un expert en nutrition vétérinaire avec 20 ans d'expérience. Tu génères des plans nutritionnels ultra-personnalisés pour chiens et chats uniquement.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT les données exactes fournies (poids, âge, race, objectif, pathologies, allergies, budget)
- Ne jamais généraliser ou inventer des valeurs différentes de celles fournies
- Si l'animal a des pathologies (diabète, insuffisance rénale, etc.), adapte TOUT le plan en conséquence
- Respecte strictement le budget mensuel indiqué
- Tiens compte du mode de vie (intérieur/extérieur/mixte) pour les quantités et l'énergie
- Adapte les portions au poids EXACT fourni, pas à un poids approximatif
- Si l'animal est stérilisé, réduis les calories de 10-15%
- Les races ont des besoins spécifiques : tiens-en compte (ex: Labrador = tendance obésité, chat Persan = problèmes rénaux fréquents)

QUALITÉ DES RECOMMANDATIONS :
- Donne des quantités précises en grammes basées sur le poids réel de l'animal
- Cite des marques réelles disponibles en France (Royal Canin, Hill's, Purina Pro Plan, Orijen, Acana...)
- Explique POURQUOI chaque recommandation est adaptée à CET animal spécifiquement
- Les conseils doivent être actionnables et concrets, pas génériques
- Pour les compléments, indique le dosage précis selon le poids de l'animal

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans texte d'introduction. Le JSON doit commencer par { et finir par }.

Le JSON doit respecter exactement ce schéma :
{
  "resume": "string (2-3 phrases résumant le plan et ses objectifs)",
  "calories_journalieres": number (entier),
  "repas": [
    {
      "moment": "string (Matin, Midi ou Soir)",
      "description": "string (contenu du repas)",
      "quantite": "string (ex: 180g ou 150ml)",
      "horaire": "string (ex: Entre 7h00 et 9h00)"
    }
  ],
  "aliments_recommandes": [
    { "aliment": "string", "raison": "string" }
  ],
  "aliments_eviter": [
    { "aliment": "string", "raison": "string" }
  ],
  "complements": [
    { "nom": "string", "dosage": "string", "benefice": "string" }
  ],
  "conseils": ["string", "string", "string", "string", "string"],
  "avertissements": []
}

RÈGLES POUR LES CONSEILS :
- Le conseil sur l'hydratation doit commencer EXACTEMENT par "Vérifiez et remplissez le bol d'eau matin et soir" — sans mentionner de poids, de quantité en ml, ni d'espèce dans cette première phrase.
- Ne jamais écrire "Un chien/chat de X kg nécessite Y ml" dans les conseils.`;

function buildPrompt(a: Record<string, unknown>): string {
  const species = a.animalType === "dog" ? "chien" : "chat";
  const sex = a.sex === "male" ? "mâle" : "femelle";
  const sterilized = a.sterilized ? "stérilisé(e)" : "non stérilisé(e)";
  const activity = ({ low: "faible", moderate: "modérée", high: "élevée", very_high: "très élevée" } as Record<string, string>)[a.activityLevel as string] ?? String(a.activityLevel ?? "non précisé");
  const goal = ({ maintain: "maintenir le poids", lose: "perdre du poids", gain: "prendre du poids" } as Record<string, string>)[a.goal as string] ?? String(a.goal ?? "non précisé");
  const lifestyle = ({ indoor: "intérieur", outdoor: "extérieur", mixed: "mixte" } as Record<string, string>)[a.lifestyle as string] ?? String(a.lifestyle ?? "non précisé");

  return `
PROFIL COMPLET DE L'ANIMAL - UTILISE CES DONNÉES EXACTES DANS TOUT LE PLAN :

Nom : ${a.name || "non précisé"}
Espèce : ${species} (GÉNÈRE UN PLAN UNIQUEMENT POUR UN ${species.toUpperCase()})
Race : ${a.breed || "non précisée"}
Taille : ${a.size || "non précisée"}
Âge : ${a.age}
Poids EXACT : ${a.weight} kg (UTILISE CE POIDS PRÉCIS DANS TOUTES TES RECOMMANDATIONS, JAMAIS UN AUTRE)
Sexe : ${sex}, ${sterilized}
Niveau d'activité : ${activity}
Objectif : ${goal}
Alimentation actuelle : ${a.currentDiet || "non précisée"}
Budget mensuel : ${a.budget ? String(a.budget) + "€" : "non précisé"}
Mode de vie : ${lifestyle}
Pathologies : ${a.conditions || "aucune"}
Allergies alimentaires : ${a.allergies || "aucune"}
Événements récents : ${a.recentEvents || "aucun"}

INSTRUCTIONS OBLIGATOIRES :
- Ce plan est UNIQUEMENT pour un ${species} de ${a.weight} kg
- Chaque conseil, quantité, dosage doit être calculé pour ${a.weight} kg
- Si l'animal est ${sterilized}, réduis les calories de 10-15%
- Tiens compte des pathologies : ${a.conditions || "aucune"}
- Tiens compte des allergies : ${a.allergies || "aucune"}
- Respecte le budget de ${a.budget || "non précisé"}€/mois
- Les marques citées doivent être disponibles en France
- RAPPEL FINAL : poids = ${a.weight} kg, espèce = ${species}, objectif = ${goal}
`.trim();
}

function sanitizePlan(plan: NutritionPlan, animalData: Record<string, unknown>): NutritionPlan {
  const realWeight = String(animalData.weight ?? "").replace(",", ".");
  const realType = animalData.animalType === "dog" ? "chien" : "chat";
  const wrongType = realType === "chien" ? "chat" : "chien";
  const realAdj = realType === "chien" ? "canin" : "félin";
  const wrongAdj = realType === "chien" ? "félin" : "canin";

  const fixText = (text: string): string => {
    // Replace any "X kg" where X differs from the real weight
    let s = text.replace(/\b(\d+(?:[.,]\d+)?)\s*kg\b/gi, (_match, num) => {
      if (parseFloat(num.replace(",", ".")) !== parseFloat(realWeight)) {
        return `${realWeight} kg`;
      }
      return _match;
    });

    // Replace wrong animal type (singular and plural, any case)
    s = s.replace(new RegExp(`\\b${wrongType}(s?)\\b`, "gi"), (_m, plural) =>
      plural ? `${realType}s` : realType,
    );

    // Replace wrong adjective (canin/félin and their feminine/plural forms)
    s = s.replace(new RegExp(`\\b${wrongAdj}(ne?s?|s?)\\b`, "gi"), (_m, suffix) =>
      `${realAdj}${suffix}`,
    );

    // Remove sentences containing both "kg" and "ml" and "nécessite" — hallucinated hydration formula
    s = s
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => {
        const l = sentence.toLowerCase();
        return !(l.includes("kg") && l.includes("ml") && l.includes("nécessite"));
      })
      .join(" ")
      .trim();

    return s;
  };

  return {
    ...plan,
    resume: fixText(plan.resume),
    repas: plan.repas.map((r) => ({ ...r, description: fixText(r.description), quantite: fixText(r.quantite) })),
    aliments_recommandes: plan.aliments_recommandes.map((a) => ({ ...a, aliment: fixText(a.aliment), raison: fixText(a.raison) })),
    aliments_eviter: plan.aliments_eviter.map((a) => ({ ...a, aliment: fixText(a.aliment), raison: fixText(a.raison) })),
    complements: plan.complements.map((c) => ({ ...c, nom: fixText(c.nom), dosage: fixText(c.dosage), benefice: fixText(c.benefice) })),
    conseils: plan.conseils.map(fixText),
    avertissements: plan.avertissements.map(fixText),
  };
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY manquant dans .env.local" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(request.url);
  const isInitial = url.searchParams.get("initial") === "true";

  // Rate limiting — skip for first generation from questionnaire
  let currentCount = 0;
  let isSameMonth = false;

  if (!isInitial) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("regenerations_count, regenerations_reset_date")
      .eq("id", user.id)
      .maybeSingle();

    console.log("[generate-plan] profil lu:", profile, "error:", profileError);

    const p = profile as { regenerations_count: number; regenerations_reset_date: string | null } | null;
    currentCount = p?.regenerations_count ?? 0;
    const resetDate = p?.regenerations_reset_date ?? null;

    const now = new Date();
    const resetD = resetDate ? new Date(resetDate + "T00:00:00") : null;
    isSameMonth = !!(resetD && resetD.getFullYear() === now.getFullYear() && resetD.getMonth() === now.getMonth());
    console.log("[generate-plan] regenerations_count avant:", currentCount, "| isSameMonth:", isSameMonth, "| resetDate:", resetDate);

    if (isSameMonth && currentCount >= 4) {
      const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextResetDate = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, "0")}-01`;
      return NextResponse.json(
        { error: "Limite de 4 mises à jour atteinte ce mois-ci", nextResetDate },
        { status: 429 },
      );
    }
  }

  const animalData = await request.json() as Record<string, unknown>;
  console.log("[generate-plan] appelé avec:", JSON.stringify(animalData).slice(0, 200));

  const rawWeight = animalData.weight;
  if (!rawWeight || rawWeight === "" || rawWeight === "0" || rawWeight === 0) {
    return NextResponse.json({ error: "Poids de l'animal manquant - impossible de générer le plan" }, { status: 400 });
  }

  // Get animal DB id for the foreign key
  const { data: animalRow } = await supabase
    .from("animals")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const animalId = (animalRow as { id: string } | null)?.id ?? null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log("PROMPT ENVOYÉ À L'IA:", JSON.stringify(buildPrompt(animalData)).slice(0, 500));

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(animalData) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "{}";
  console.log("RÉPONSE BRUTE DE L'IA:", rawText.slice(0, 500));
  console.log("[generate-plan] Réponse brute Claude:", rawText);

  let plan: NutritionPlan;
  try {
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    plan = sanitizePlan(JSON.parse(cleaned) as NutritionPlan, animalData);
    console.log("[generate-plan] Plan après sanitize:", JSON.stringify(plan).slice(0, 300));
  } catch (err) {
    console.error("[generate-plan] JSON parse error:", err, "\nRaw:", rawText);
    return NextResponse.json({ error: "Réponse IA invalide — réessayez" }, { status: 500 });
  }

  // Always insert a new plan row to preserve history
  await supabase.from("plans").insert({
    user_id: user.id,
    animal_id: animalId,
    contenu: plan,
  });

  // Increment regeneration counter (skip for initial generation)
  if (!isInitial) {
    const now = new Date();
    const newCount = isSameMonth ? currentCount + 1 : 1;
    const resetDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    console.log("[generate-plan] regenerations_count avant:", currentCount, "→ après:", newCount);
    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({ regenerations_count: newCount, regenerations_reset_date: resetDateStr })
      .eq("id", user.id)
      .select("regenerations_count, regenerations_reset_date");
    console.log("[generate-plan] update regenerations_count résultat:", updateData, updateError);
  }

  return NextResponse.json({ plan });
}
