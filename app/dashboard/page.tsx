"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuestionnaireData, NutritionPlan } from "../_lib/types";
import { supabase } from "../_lib/supabase";
import { getAnimal, getPlan } from "../_lib/db";
import {
  FlameIcon,
  ScaleIcon,
  CalendarIcon,
  StarIcon,
  UtensilsIcon,
  PawPrintIcon,
  DogIcon,
  CatIcon,
  LightBulbIcon,
  CheckIcon,
  CheckCircleIcon,
  TriangleAlertIcon,
} from "../_components/Icons";


const ACTIVITY_LABELS: Record<string, string> = {
  low: "Faible",
  moderate: "Modéré",
  high: "Élevé",
  very_high: "Très élevé",
};
const GOAL_LABELS: Record<string, string> = {
  maintain: "Maintenir le poids",
  lose: "Perdre du poids",
  gain: "Prendre du poids",
};

type Tip = { title: string; body: string };

function getTips(goal: string | null, activity: string | null): Tip[] {
  const base: Record<string, Tip[]> = {
    maintain: [
      {
        title: "Stabilité des portions",
        body: "Pour maintenir le poids idéal, la précision des quantités est essentielle. Pesez les portions une fois par semaine et utilisez toujours le même bol doseur. Une variation de ±5% dans les apports journaliers est normale — au-delà, ajustez progressivement.",
      },
      {
        title: "Qualité des protéines avant tout",
        body: "Les protéines sont le pilier d'un poids stable. Privilégiez des sources animales de haute qualité comme le poulet, le saumon ou l'agneau. Elles soutiennent la masse musculaire et favorisent la satiété, réduisant les comportements de quête alimentaire entre les repas.",
      },
      {
        title: "Hydratation quotidienne",
        body: "Un chien adulte de 30 kg nécessite 300–500 ml d'eau fraîche par jour. Vérifiez et remplissez le bol matin et soir. En été ou après l'effort, ce besoin peut augmenter de 30%. La déshydratation chronique affecte les reins, l'énergie et la digestion.",
      },
      {
        title: "Régularité des horaires",
        body: "Des repas servis aux mêmes heures chaque jour régulent le métabolisme et améliorent la digestion. Évitez les repas trop tardifs (après 20h) car le métabolisme ralentit le soir. Deux prises par jour, espacées de 10–12h, constituent le rythme optimal.",
      },
      {
        title: "Surveillance mensuelle du poids",
        body: "Pesez votre animal le même jour chaque mois et notez l'évolution dans le tableau de bord. Une prise ou perte supérieure à 2% du poids corporel en un mois justifie un ajustement des portions ou une consultation vétérinaire.",
      },
    ],
    lose: [
      {
        title: "Réduction progressive et sécurisée",
        body: "Ne réduisez jamais les portions de plus de 10% à la fois. Une perte de poids saine ne dépasse pas 1–2% du poids corporel par semaine. Au-delà, des carences nutritionnelles peuvent apparaître et fragiliser l'organisme, notamment les muscles et le système immunitaire.",
      },
      {
        title: "Fibres et sensation de satiété",
        body: "Ajoutez des légumes faibles en calories comme des haricots verts cuits ou des carottes râpées (max 10% de la ration totale). Les fibres ralentissent la digestion, prolongent la satiété et aident votre animal à ne pas réclamer entre les repas sans ajouter de calories significatives.",
      },
      {
        title: "Supprimer les calories cachées",
        body: "Les friandises représentent souvent 15–25% des apports journaliers sans que les propriétaires s'en rendent compte. Passez à des récompenses légères (petits morceaux de carotte, dés de poulet cuit sans assaisonnement) et réduisez les friandises à 5% maximum de la ration.",
      },
      {
        title: "Exercice progressif et régulier",
        body: "Augmentez les sorties de 10–15 minutes par semaine jusqu'à atteindre 45–60 minutes d'activité modérée quotidienne. L'exercice préserve la masse musculaire pendant la perte de poids, ce qui est crucial pour éviter l'effet yoyo une fois le régime terminé.",
      },
      {
        title: "Patience et régularité",
        body: "La perte de poids correcte prend du temps : attendez 4 à 6 semaines avant d'évaluer les résultats. Pesez votre animal toutes les 2 semaines et ajustez les portions de −5% si la progression stagne, ou revenez en arrière si la perte est trop rapide (>2% par semaine).",
      },
    ],
    gain: [
      {
        title: "Augmentation graduelle des portions",
        body: "Augmentez les rations de 10% toutes les 2 semaines jusqu'à atteindre le poids cible. Une prise trop rapide favorise la graisse au détriment du muscle. L'idéal est une progression de 1–1,5% du poids corporel par semaine sur plusieurs semaines.",
      },
      {
        title: "Protéines pour la masse musculaire",
        body: "Visez un apport minimum de 30–35% de protéines de qualité dans la ration quotidienne. Les sources animales (viande, poisson) sont les plus assimilables. Évitez les protéines végétales en trop grande proportion car leur biodisponibilité est inférieure pour les carnivores.",
      },
      {
        title: "Fractionner en 3 repas par jour",
        body: "Passez temporairement à 3 repas par jour au lieu de 2. Cela augmente l'apport calorique total sans surcharger le système digestif à chaque repas. Les chiens et chats tolèrent généralement très bien 3 prises journalières pendant la phase de prise de poids.",
      },
      {
        title: "Compléments pour soutenir la prise de poids",
        body: "Les compléments en oméga-3 (huile de saumon, 1 cuillère à soupe par jour pour un grand chien) apportent des lipides de qualité et soutiennent l'absorption des vitamines liposolubles A, D, E et K. La vitamine B12 peut également favoriser l'appétit.",
      },
      {
        title: "Monitoring bimensuel",
        body: "Pesez votre animal toutes les 2 semaines et ajustez si la prise dépasse 2% du poids par semaine (risque de surcharge graisseuse). Consultez votre vétérinaire si malgré une augmentation des portions votre animal ne prend pas de poids après 3 semaines consécutives.",
      },
    ],
  };

  const activityTip: Record<string, Tip> = {
    low: {
      title: "Stimulation mentale pour un animal peu actif",
      body: "Un animal peu actif physiquement a besoin de stimulation mentale pour éviter l'ennui et les comportements compulsifs. Les jeux de recherche alimentaire, les Kong remplis d'une part de sa ration ou les puzzles alimentaires sont excellents — ils ralentissent l'ingestion et stimulent le cerveau sans ajouter de calories.",
    },
    moderate: {
      title: "Constance des sorties",
      body: "Un niveau d'activité modéré idéal se traduit par 30–45 minutes de marche quotidienne. Essayez de maintenir ce rythme même les week-ends pour éviter les pics et creux d'activité qui déstabilisent le métabolisme et peuvent provoquer des troubles digestifs le lundi.",
    },
    high: {
      title: "Récupération post-effort",
      body: "Après une activité intense, attendez 30 minutes avant de servir le repas pour éviter les problèmes gastriques (notamment le retournement de l'estomac, fréquent chez les grandes races comme les Labradors et Bergers). Proposez de l'eau fraîche immédiatement après l'effort, mais en petite quantité.",
    },
    very_high: {
      title: "Alimentation sportive adaptée",
      body: "Pour un animal très actif (sport, travail, chasse), les besoins caloriques peuvent être 50–80% supérieurs à un animal sédentaire. Distribuez le supplément énergétique avant l'effort sous forme de repas léger riche en glucides complexes, et le repas principal 1h après la récupération.",
    },
  };

  const tips = base[goal ?? "maintain"] ?? base.maintain;
  const extra = activityTip[activity ?? "moderate"];

  // Replace last generic tip with activity-specific one if available
  if (extra) {
    return [...tips.slice(0, 4), extra];
  }
  return tips;
}

export default function DashboardPage() {
  const [pet, setPet] = useState<QuestionnaireData | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [animal, nutritionPlan] = await Promise.all([
          getAnimal(user.id),
          getPlan(user.id),
        ]);
        if (animal) setPet(animal);
        if (nutritionPlan) setPlan(nutritionPlan);
      } else {
        // Admin / unauthenticated fallback
        const raw =
          localStorage.getItem("petnutri_data") ??
          sessionStorage.getItem("petnutri_data");
        if (raw) {
          try { setPet(JSON.parse(raw) as QuestionnaireData); } catch { /* ignore */ }
        }
      }
      setSubscribed(
        localStorage.getItem("petnutri_subscribed") === "true" ||
          sessionStorage.getItem("petnutri_subscribed") === "true",
      );
      setPhoto(localStorage.getItem("petnutri_photo"));
    }
    load();
  }, []);

  const stats = [
    { Icon: FlameIcon, label: "Calories/jour", value: plan?.calories_journalieres ? `${plan.calories_journalieres} kcal` : "—", change: plan ? "Plan IA" : "En attente", ok: true },
    { Icon: ScaleIcon, label: "Poids actuel", value: pet?.weight ? `${pet.weight} kg` : "—", change: "Profil", ok: true },
    { Icon: CalendarIcon, label: "Repas par jour", value: plan?.repas?.length ? `${plan.repas.length} repas` : "—", change: plan ? "Planifié" : "En attente", ok: true },
    { Icon: StarIcon, label: "Compléments", value: plan?.complements?.length != null ? `${plan.complements.length}` : "—", change: plan ? "Recommandés" : "En attente", ok: true },
  ];

  const recentMeals = plan?.repas?.map((m, i) => ({
    time: `${m.moment ?? "—"} · ${m.horaire ?? "—"}`,
    name: (m.description?.length ?? 0) > 60 ? m.description.slice(0, 60) + "…" : (m.description ?? "—"),
    amount: m.quantite ?? "—",
    done: i === 0,
  })) ?? [
    { time: "—", name: "Aucun plan généré", amount: "—", done: false },
  ];

  const isDog = pet ? pet.animalType !== "cat" : true;
  const PetIcon = isDog ? DogIcon : CatIcon;
  const animalLabel = isDog ? "Chien" : "Chat";
  const sexLabel = pet?.sex === "female" ? "Femelle" : "Mâle";
  const displayName = pet?.name || pet?.breed || "votre animal";

  const profileRows = [
    { label: "Poids actuel", value: pet?.weight ? `${pet.weight} kg` : "30 kg" },
    { label: "Activité", value: pet?.activityLevel ? (ACTIVITY_LABELS[pet.activityLevel] ?? "—") : "Élevé" },
    { label: "Objectif", value: pet?.goal ? (GOAL_LABELS[pet.goal] ?? "—") : "Maintenir le poids" },
    { label: "Budget mensuel", value: pet?.budget ? `${pet.budget} €` : "—" },
  ];

  const tips = getTips(pet?.goal ?? null, pet?.activityLevel ?? null);
  const hasConditions = !!(pet?.conditions?.trim());

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={displayName}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-petblue/30"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-petblue/10">
              <PetIcon className="h-6 w-6 text-petblue" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour — voici le plan de{" "}
              <span className="text-petblue">{displayName}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Récapitulatif nutritionnel de votre animal.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {subscribed && (
            <div className="flex items-center gap-1.5 rounded-xl border border-petblue/30 bg-petblue/10 px-3 py-1.5 text-xs font-medium text-slate-700">
              <CheckCircleIcon className="h-3.5 w-3.5 text-petblue" />
              Abonnement actif
            </div>
          )}
          <Link
            href="/questionnaire"
            className="rounded-xl border border-petblue/40 bg-petblue/10 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-petblue/20"
          >
            + Nouveau plan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ Icon, label, value, change, ok }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-petblue/10">
              <Icon className="h-5 w-5 text-petblue" />
            </div>
            <div className="text-lg font-bold text-slate-900">{value}</div>
            <div className="mt-0.5 text-xs text-slate-400">{label}</div>
            <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ok ? "bg-petblue/20 text-slate-700" : "bg-red-50 text-red-600"}`}>
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's meals */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <UtensilsIcon className="h-5 w-5 text-petblue" />
              Repas du jour
            </h2>
            <div className="space-y-3">
              {recentMeals.map((m) => (
                <div
                  key={m.time}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${m.done ? "bg-petblue/15" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${m.done ? "bg-petblue text-slate-900" : "border-2 border-slate-300 bg-white"}`}>
                      {m.done && <CheckIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{m.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animal profile card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <PawPrintIcon className="h-5 w-5 text-petblue" />
            Mon animal
          </h2>
          <div className="flex flex-col items-center text-center">
            {photo ? (
              <img src={photo} alt={displayName} className="h-20 w-20 rounded-full object-cover ring-2 ring-petblue/30" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-petblue/10">
                <PetIcon className="h-10 w-10 text-petblue" />
              </div>
            )}
            <h3 className="mt-3 font-bold text-slate-900">{displayName}</h3>
            <p className="text-sm text-slate-400">
              {[animalLabel, sexLabel, pet?.age || "3 ans"].filter(Boolean).join(" · ")}
            </p>
            {pet?.breed && pet.name && (
              <p className="mt-0.5 text-xs text-slate-400">{pet.breed}</p>
            )}
            <div className="mt-4 w-full space-y-2 text-left">
              {profileRows.map((item) => (
                <div key={item.label} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/animal"
              className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-center text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50"
            >
              Modifier le profil
            </Link>
          </div>
        </div>
      </div>

      {/* Conseils */}
      <div className="mt-6 space-y-4">
        {/* Medical conditions warning */}
        {hasConditions && (
          <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <TriangleAlertIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
            <div>
              <p className="font-semibold text-orange-800">
                Attention : conditions médicales détectées
              </p>
              <p className="mt-1 text-sm text-orange-700">
                Votre animal présente des conditions médicales renseignées ({pet?.conditions}).
                Les recommandations ci-dessous sont générales. Consultez votre vétérinaire pour
                des recommandations spécifiques adaptées à sa condition.
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl border border-petblue bg-petblue/15 p-5">
          <div className="mb-4 flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-slate-700" />
            <p className="font-semibold text-slate-900">
              Conseils pour{" "}
              {pet?.goal ? GOAL_LABELS[pet.goal]?.toLowerCase() : "maintenir le poids"}
            </p>
          </div>
          <div className="space-y-4">
            {tips.map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-petblue/40">
                  <CheckIcon className="h-3 w-3 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tip.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
