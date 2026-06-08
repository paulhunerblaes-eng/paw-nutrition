"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuestionnaireData, NutritionPlan } from "../../_lib/types";
import { supabase } from "../../_lib/supabase";
import { getAnimal, getPlan } from "../../_lib/db";
import {
  FlameIcon,
  UtensilsIcon,
  ScaleIcon,
  DropletIcon,
  PillIcon,
  NoSymbolIcon,
  ListBulletIcon,
  DogIcon,
  CatIcon,
  CheckCircleIcon,
  SparklesIcon,
  PawPrintIcon,
  CheckIcon,
} from "../../_components/Icons";

function GeneratingScreen() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative mb-8 h-24 w-24">
          <div
            className="animate-spin-slow absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #90D5FF 0%, #90D5FF 65%, rgba(144,213,255,0.08) 82%, transparent 100%)",
            }}
          />
          <div className="absolute inset-[6px] rounded-full bg-slate-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrintIcon className="animate-pulse-soft h-9 w-9 text-petblue" />
          </div>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          Génération de votre plan{dots}
        </h2>
        <p className="text-sm text-slate-400">
          Claude analyse le profil de votre animal et prépare des recommandations personnalisées. Cela prend environ 15 secondes.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPlanPage() {
  const [pet, setPet] = useState<QuestionnaireData | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Load animal profile
      const animal = await getAnimal(user.id);
      if (animal) setPet(animal);

      // Load existing plan from DB
      const existingPlan = await getPlan(user.id);
      console.log("[plan page] getPlan résultat:", existingPlan ? "plan trouvé" : "null");
      if (existingPlan) {
        setPlan(existingPlan);
        setLoading(false);
        return;
      }

      setLoading(false);

      // No plan yet — generate one if we have animal data
      if (!animal) return;
      setGenerating(true);
      try {
        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(animal),
        });
        const json = await res.json() as { plan?: NutritionPlan; error?: string };
        if (json.plan) {
          setPlan(json.plan);
        } else {
          setError(json.error ?? "Erreur lors de la génération du plan.");
        }
      } catch {
        setError("Erreur réseau. Veuillez rafraîchir la page.");
      } finally {
        setGenerating(false);
      }
    }
    load();
  }, []);

  const regenerate = async () => {
    if (!pet) return;
    setError(null);
    setPlan(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      });
      const json = await res.json() as { plan?: NutritionPlan; error?: string };
      if (json.plan) setPlan(json.plan);
      else setError(json.error ?? "Erreur lors de la génération.");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setGenerating(false);
    }
  };

  const isDog = pet ? pet.animalType !== "cat" : true;
  const AnimalIcon = isDog ? DogIcon : CatIcon;
  const petName = pet?.name || pet?.breed || "votre animal";

  if (loading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-petblue" />
    </div>
  );

  if (generating) return <GeneratingScreen />;

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={regenerate}
          className="rounded-xl bg-petblue px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-petblue/80"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500">
          Aucun plan trouvé. Complétez le questionnaire pour générer votre plan.
        </p>
        <Link
          href="/questionnaire"
          className="rounded-xl bg-petblue px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-petblue/80"
        >
          Faire le questionnaire →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon plan nutritionnel</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <AnimalIcon className="h-4 w-4" />
            Plan personnalisé pour {petName}
          </p>
        </div>
        <button
          type="button"
          onClick={regenerate}
          className="flex-shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 transition-all hover:border-petblue hover:text-slate-800"
        >
          Régénérer
        </button>
      </div>

      {/* Resume banner */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-petblue/30 bg-petblue/5 p-4">
        <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-petblue" />
        <p className="text-sm text-slate-700">{plan.resume}</p>
      </div>

      {/* Warnings (if any) */}
      {plan.avertissements && plan.avertissements.length > 0 && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-sm font-semibold text-red-700">⚠ Alertes importantes</p>
          <ul className="space-y-1">
            {plan.avertissements.map((w, i) => (
              <li key={i} className="text-sm text-red-600">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { Icon: FlameIcon, label: "Calories/jour", value: `${plan.calories_journalieres} kcal` },
          { Icon: UtensilsIcon, label: "Repas/jour", value: `${plan.repas.length} repas` },
          { Icon: ScaleIcon, label: "Compléments", value: `${plan.complements.length}` },
          { Icon: DropletIcon, label: "Aliments ✓", value: `${plan.aliments_recommandes.length}` },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <div className="flex justify-center">
              <Icon className="h-6 w-6 text-petblue" />
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meal schedule */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <UtensilsIcon className="h-5 w-5 text-petblue" />
            Programme des repas
          </h2>
          <div className="space-y-3">
            {plan.repas.map((m, i) => (
              <div key={i} className="rounded-xl bg-petblue/10 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{m.moment}</p>
                    <p className="text-xs text-slate-500">{m.horaire}</p>
                    <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                  </div>
                  <span className="flex-shrink-0 font-semibold text-slate-800">{m.quantite}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplements */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <PillIcon className="h-5 w-5 text-petblue" />
            Compléments recommandés
          </h2>
          <ul className="space-y-3">
            {plan.complements.map((c, i) => (
              <li key={i} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{c.nom}</p>
                  <span className="flex-shrink-0 rounded-full bg-petblue/10 px-2 py-0.5 text-xs font-medium text-petblue">
                    {c.dosage}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{c.benefice}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to recommend */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <CheckIcon className="h-5 w-5 text-petblue" />
            Aliments recommandés
          </h2>
          <ul className="space-y-2.5">
            {plan.aliments_recommandes.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-petblue" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.aliment}</p>
                  <p className="text-xs text-slate-500">{a.raison}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to avoid */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <NoSymbolIcon className="h-5 w-5 text-red-400" />
            Aliments à éviter
          </h2>
          <ul className="space-y-2.5">
            {plan.aliments_eviter.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.aliment}</p>
                  <p className="text-xs text-slate-500">{a.raison}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalised advice */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
          <ListBulletIcon className="h-5 w-5 text-petblue" />
          Conseils personnalisés
        </h2>
        <ul className="space-y-3">
          {plan.conseils.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-petblue" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Update link */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-petblue/20 bg-petblue/5 px-5 py-4">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">Profil modifié ?</span>{" "}
          Mettez à jour les informations de {petName} puis régénérez le plan.
        </p>
        <Link
          href="/dashboard/animal"
          className="ml-4 flex-shrink-0 rounded-xl bg-petblue px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-petblue/80"
        >
          Modifier
        </Link>
      </div>
    </div>
  );
}
