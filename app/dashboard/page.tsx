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

function getTips(goal: string | null, activity: string | null, animalType: string | null): Tip[] {
  const isdog = animalType !== "cat";
  const animal = isdog ? "votre chien" : "votre chat";
  const Animal = isdog ? "Votre chien" : "Votre chat";

  const base: Record<string, Tip[]> = {
    maintain: [
      {
        title: "Stabilité des portions",
        body: `Pour maintenir le poids idéal, la précision des quantités est essentielle. Pesez les portions une fois par semaine et utilisez toujours le même bol doseur. Une légère variation dans les apports journaliers est normale — au-delà, ajustez progressivement.`,
      },
      {
        title: "Qualité des protéines avant tout",
        body: `Les protéines sont le pilier d'un poids stable. Privilégiez des sources animales de haute qualité comme le poulet, le saumon ou l'agneau. Elles soutiennent la masse musculaire et favorisent la satiété, réduisant les comportements de quête alimentaire entre les repas.`,
      },
      {
        title: "Hydratation quotidienne",
        body: `Vérifiez et remplissez le bol d'eau matin et soir. En été ou après l'effort, les besoins en eau augmentent significativement. La déshydratation chronique affecte les reins, l'énergie et la digestion de ${animal}.`,
      },
      {
        title: "Régularité des horaires",
        body: `Des repas servis aux mêmes heures chaque jour régulent le métabolisme et améliorent la digestion. Évitez les repas trop tardifs car le métabolisme ralentit le soir. Deux prises par jour, espacées de 10–12h, constituent le rythme optimal.`,
      },
      {
        title: "Surveillance mensuelle du poids",
        body: `Pesez ${animal} le même jour chaque mois et notez l'évolution. Une variation importante en un mois justifie un ajustement des portions ou une consultation vétérinaire.`,
      },
    ],
    lose: [
      {
        title: "Réduction progressive et sécurisée",
        body: `Ne réduisez jamais les portions brutalement. Une perte de poids saine est lente et progressive. Au-delà d'une certaine vitesse, des carences nutritionnelles peuvent apparaître et fragiliser l'organisme, notamment les muscles et le système immunitaire de ${animal}.`,
      },
      {
        title: "Fibres et sensation de satiété",
        body: `Ajoutez des légumes faibles en calories comme des haricots verts cuits ou des carottes râpées (max 10% de la ration totale). Les fibres ralentissent la digestion, prolongent la satiété et aident ${animal} à ne pas réclamer entre les repas sans ajouter de calories significatives.`,
      },
      {
        title: "Supprimer les calories cachées",
        body: `Les friandises représentent souvent une part importante des apports journaliers sans que les propriétaires s'en rendent compte. Passez à des récompenses légères (petits morceaux de carotte, dés de poulet cuit sans assaisonnement) et limitez les friandises au strict minimum.`,
      },
      {
        title: isdog ? "Sorties et exercice progressif" : "Jeux et activité progressive",
        body: isdog
          ? `Augmentez progressivement la durée des sorties chaque semaine. L'exercice préserve la masse musculaire pendant la perte de poids, ce qui est crucial pour éviter l'effet yoyo une fois le régime terminé.`
          : `Encouragez les sessions de jeu quotidiennes avec des jouets interactifs. L'activité physique régulière préserve la masse musculaire de votre chat et accélère la perte de masse graisseuse.`,
      },
      {
        title: "Patience et régularité",
        body: `La perte de poids correcte prend du temps : attendez plusieurs semaines avant d'évaluer les résultats. Pesez ${animal} régulièrement et ajustez les portions si la progression stagne, en consultant votre vétérinaire si nécessaire.`,
      },
    ],
    gain: [
      {
        title: "Augmentation graduelle des portions",
        body: `Augmentez les rations progressivement sur plusieurs semaines jusqu'à atteindre le poids cible. Une prise trop rapide favorise la graisse au détriment du muscle. Privilégiez une progression régulière et contrôlée.`,
      },
      {
        title: "Protéines pour la masse musculaire",
        body: `Visez un apport élevé en protéines de qualité dans la ration quotidienne. Les sources animales (viande, poisson) sont les plus assimilables pour ${animal}. Évitez les protéines végétales en trop grande proportion car leur biodisponibilité est inférieure pour les carnivores.`,
      },
      {
        title: "Fractionner en 3 repas par jour",
        body: `Passez temporairement à 3 repas par jour au lieu de 2. Cela augmente l'apport calorique total sans surcharger le système digestif de ${animal} à chaque repas.`,
      },
      {
        title: "Compléments pour soutenir la prise de poids",
        body: `Les compléments en oméga-3 (huile de saumon) apportent des lipides de qualité et soutiennent l'absorption des vitamines liposolubles A, D, E et K. ${Animal} peut également bénéficier d'un complexe vitaminé B pour stimuler l'appétit.`,
      },
      {
        title: "Suivi régulier du poids",
        body: `Pesez ${animal} toutes les 2 semaines et ajustez si la prise est trop rapide (risque de surcharge graisseuse). Consultez votre vétérinaire si, malgré une augmentation des portions, le poids ne progresse pas après 3 semaines consécutives.`,
      },
    ],
  };

  const activityTip: Record<string, Tip> = {
    low: {
      title: isdog ? "Stimulation mentale pour un chien peu actif" : "Enrichissement pour un chat peu actif",
      body: isdog
        ? `Un chien peu actif physiquement a besoin de stimulation mentale pour éviter l'ennui et les comportements compulsifs. Les jeux de recherche alimentaire, les Kong remplis ou les puzzles alimentaires sont excellents — ils ralentissent l'ingestion et stimulent le cerveau sans ajouter de calories.`
        : `Un chat peu actif a besoin de stimulation mentale et physique. Les jouets de chasse, les puzzles alimentaires et les séances de jeu interactif quotidiennes sont idéaux pour stimuler son instinct naturel tout en brûlant des calories.`,
    },
    moderate: {
      title: "Constance de l'activité",
      body: `Essayez de maintenir un rythme d'activité régulier même les week-ends pour éviter les pics et creux qui déstabilisent le métabolisme de ${animal} et peuvent provoquer des troubles digestifs.`,
    },
    high: {
      title: "Récupération post-effort",
      body: isdog
        ? `Après une activité intense, attendez au moins 30 minutes avant de servir le repas pour éviter les problèmes gastriques. Proposez de l'eau fraîche immédiatement après l'effort, mais en petite quantité d'abord.`
        : `Après une session de jeu intense, laissez votre chat se calmer avant de servir son repas. Proposez de l'eau fraîche en accès libre pour compenser la perte hydrique due à l'activité.`,
    },
    very_high: {
      title: "Alimentation pour animal très actif",
      body: `Pour ${animal} très actif, les besoins caloriques peuvent être significativement supérieurs à un animal sédentaire. Distribuez un repas léger avant l'effort et le repas principal après la récupération.`,
    },
  };

  const tips = base[goal ?? "maintain"] ?? base.maintain;
  const extra = activityTip[activity ?? "moderate"];

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
  const [checkedMeals, setCheckedMeals] = useState<Set<number>>(new Set());

  const todayKey = `petnutri_meals_${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    const saved = localStorage.getItem(todayKey);
    setCheckedMeals(saved ? new Set(JSON.parse(saved) as number[]) : new Set());
  }, [todayKey]);

  const toggleMeal = (index: number) => {
    setCheckedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      localStorage.setItem(todayKey, JSON.stringify([...next]));
      return next;
    });
  };

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
    index: i,
    time: `${m.moment ?? "—"} · ${m.horaire ?? "—"}`,
    name: (m.description?.length ?? 0) > 60 ? m.description.slice(0, 60) + "…" : (m.description ?? "—"),
    amount: m.quantite ?? "—",
  })) ?? [
    { index: -1, time: "—", name: "Aucun plan généré", amount: "—" },
  ];

  const isDog = pet ? pet.animalType !== "cat" : true;
  const PetIcon = isDog ? DogIcon : CatIcon;
  const animalLabel = isDog ? "Chien" : "Chat";
  const sexLabel = pet?.sex === "female" ? "Femelle" : "Mâle";
  const displayName = pet?.name || pet?.breed || "votre animal";

  const profileRows = [
    { label: "Poids actuel", value: pet?.weight ? `${pet.weight} kg` : "—" },
    { label: "Activité", value: pet?.activityLevel ? (ACTIVITY_LABELS[pet.activityLevel] ?? "—") : "Élevé" },
    { label: "Objectif", value: pet?.goal ? (GOAL_LABELS[pet.goal] ?? "—") : "Maintenir le poids" },
    { label: "Budget mensuel", value: pet?.budget ? `${pet.budget} €` : "—" },
  ];

  const tips = getTips(pet?.goal ?? null, pet?.activityLevel ?? null, pet?.animalType ?? null);
  const hasConditions = !!(pet?.conditions?.trim());

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3 md:mb-8">
        <div className="flex min-w-0 items-center gap-3">
          {photo ? (
            <img
              src={photo}
              alt={displayName}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-petblue/30 md:h-12 md:w-12"
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-petblue/10 md:h-12 md:w-12">
              <PetIcon className="h-5 w-5 text-petblue md:h-6 md:w-6" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 md:text-2xl">
              Bonjour,{" "}
              <span className="text-petblue">{displayName}</span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
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

      <div className="grid w-full gap-6 overflow-hidden lg:grid-cols-3">
        {/* Today's meals */}
        <div className="min-w-0 lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
              <UtensilsIcon className="h-5 w-5 text-petblue" />
              Repas du jour
            </h2>
            <p className="mb-4 text-xs text-slate-400">Cochez les repas donnés aujourd&apos;hui</p>
            <div className="space-y-3">
              {recentMeals.map((m) => {
                const done = checkedMeals.has(m.index);
                return (
                  <button
                    key={m.index}
                    type="button"
                    onClick={() => m.index >= 0 && toggleMeal(m.index)}
                    disabled={m.index < 0}
                    className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${done ? "bg-petblue/15" : "bg-slate-50 hover:bg-slate-100"} ${m.index < 0 ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {/* Ligne 1 : checkbox + nom + quantité */}
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${done ? "bg-petblue text-slate-900" : "border-2 border-slate-300 bg-white"}`}>
                        {done && <CheckIcon className="h-4 w-4" />}
                      </div>
                      <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900" style={{ minWidth: 0, flex: '1 1 0%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                          <span className="flex-shrink-0 text-sm font-semibold text-slate-700" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '45%' }}>{m.amount}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">{m.time}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                href="/dashboard/plan"
                className="text-sm font-medium text-petblue hover:underline"
              >
                Voir le plan nutritionnel complet →
              </Link>
            </div>
          </div>
        </div>

        {/* Animal profile card */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
                <div key={item.label} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="flex-shrink-0 text-slate-500">{item.label}</span>
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-right font-medium text-slate-900">{item.value}</span>
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
