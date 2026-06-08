"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  type QuestionnaireData,
  type AnimalType,
  type Size,
  type Sex,
  type ActivityLevel,
  type Goal,
  type Lifestyle,
  defaultQuestionnaireData,
} from "../_lib/types";
import {
  PawPrintIcon,
  DogIcon,
  CatIcon,
  BalanceIcon,
  TrendDownIcon,
  DumbbellIcon,
  IndoorIcon,
  LeafIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
} from "../_components/Icons";
import { supabase } from "../_lib/supabase";
import { upsertAnimal } from "../_lib/db";

type StepState = "hidden" | "pending" | "done";
const LOAD_STEPS = [
  "Analyse des besoins nutritionnels",
  "Calcul des portions personnalisées",
  "Sélection des produits adaptés",
];
const PROGRESS_PCT = [5, 38, 68, 100];
function loadStepState(index: number, phase: number): StepState {
  if (index === 0) return phase >= 1 ? "done" : "pending";
  if (index === 1) return phase >= 2 ? "done" : phase >= 1 ? "pending" : "hidden";
  return phase >= 3 ? "done" : phase >= 2 ? "pending" : "hidden";
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Étape {current} sur {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-petblue transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < current ? "bg-petblue" : "bg-slate-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>(defaultQuestionnaireData);
  const [generating, setGenerating] = useState(false);
  const [phase, setPhase] = useState(0);

  // Redirect to /auth if not logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth");
    });
  }, [router]);

  // Animation phases — driven by API call duration
  useEffect(() => {
    if (!generating) return;
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 6000);
    const t3 = setTimeout(() => setPhase(3), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [generating]);

  const update = <K extends keyof QuestionnaireData>(
    key: K,
    value: QuestionnaireData[K]
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const canGoNext = () => {
    if (step === 1)
      return data.animalType && data.size && data.age && data.weight && data.sex && data.activityLevel;
    if (step === 2) return data.goal;
    return data.lifestyle;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    setGenerating(true);

    try {
      // Save animal profile to Supabase
      await upsertAnimal(data, user.id);

      // Generate nutrition plan via Claude
      const res = await fetch("/api/generate-plan?initial=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.error("[questionnaire] generate-plan échoué:", res.status);
      }
    } catch (e) {
      console.error("[questionnaire] Erreur:", e);
    }

    router.push("/dashboard");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20";

  if (generating) {
    const progress = PROGRESS_PCT[phase];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-petblue/5 px-6">
        <div className="flex w-full max-w-sm flex-col items-center">
          <div className="relative mb-10 h-32 w-32">
            <div
              className="animate-spin-slow absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #90D5FF 0%, #90D5FF 65%, rgba(144,213,255,0.08) 82%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{ boxShadow: "0 0 32px 8px rgba(144,213,255,0.45)" }}
            />
            <div className="absolute inset-[7px] rounded-full bg-slate-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PawPrintIcon className="animate-pulse-soft h-11 w-11 text-petblue" />
            </div>
          </div>

          <h2 className="mb-7 text-center text-lg font-semibold tracking-tight text-slate-800">
            Nous analysons le profil de votre animal…
          </h2>

          <div className="mb-8 w-full space-y-3.5">
            {LOAD_STEPS.map((label, i) => {
              const state = loadStepState(i, phase);
              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 transition-all duration-500 ease-out ${
                    state === "hidden" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
                  }`}
                >
                  <div
                    className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors duration-300 ${
                      state === "done" ? "bg-petblue" : state === "pending" ? "animate-pulse bg-petblue/50" : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`flex-1 text-sm transition-colors duration-300 ${
                      state === "done" ? "font-medium text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {state === "pending" && (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-petblue/20 border-t-petblue" />
                    )}
                    {state === "done" && <CheckIcon className="h-4 w-4 text-petblue" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-petblue transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petblue/10 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <PawPrintIcon className="h-6 w-6 text-petblue" />
            <span className="text-xl font-bold text-slate-900">
              Pet<span className="text-petblue">Nutri</span>
            </span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100">
          <StepIndicator current={step} total={3} />

          {/* Step 1 — Profil de l'animal */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Profil de votre animal
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Commençons par faire connaissance avec votre compagnon.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Type d&apos;animal *
                </label>
                <div className="flex gap-3">
                  {(
                    [
                      { val: "dog", label: "Chien", Icon: DogIcon },
                      { val: "cat", label: "Chat", Icon: CatIcon },
                    ] as const
                  ).map(({ val, label, Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update("animalType", val as AnimalType)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                        data.animalType === val
                          ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Race
                </label>
                <input
                  type="text"
                  placeholder="Ex : Labrador, Maine Coon..."
                  value={data.breed}
                  onChange={(e) => update("breed", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Taille *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "small", label: "Petit" },
                      { val: "medium", label: "Moyen" },
                      { val: "large", label: "Grand" },
                      { val: "giant", label: "Géant" },
                    ] as const
                  ).map(({ val, label }) => (
                    <ToggleButton
                      key={val}
                      active={data.size === val}
                      onClick={() => update("size", val as Size)}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Âge *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 3 ans, 6 mois"
                    value={data.age}
                    onChange={(e) => update("age", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Poids (kg) *
                  </label>
                  <input
                    type="number"
                    placeholder="Ex : 12"
                    min={0}
                    step={0.1}
                    value={data.weight}
                    onChange={(e) => update("weight", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sexe *
                </label>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { val: "male", label: "Mâle" },
                      { val: "female", label: "Femelle" },
                    ] as const
                  ).map(({ val, label }) => (
                    <ToggleButton
                      key={val}
                      active={data.sex === val}
                      onClick={() => update("sex", val as Sex)}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
                    <input
                      type="checkbox"
                      checked={data.sterilized}
                      onChange={(e) => update("sterilized", e.target.checked)}
                      className="h-4 w-4 rounded accent-petblue"
                    />
                    Stérilisé(e)
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Niveau d&apos;activité *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "low", label: "Faible" },
                      { val: "moderate", label: "Modéré" },
                      { val: "high", label: "Élevé" },
                      { val: "very_high", label: "Très élevé" },
                    ] as const
                  ).map(({ val, label }) => (
                    <ToggleButton
                      key={val}
                      active={data.activityLevel === val}
                      onClick={() => update("activityLevel", val as ActivityLevel)}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Objectifs et alimentation */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Objectifs & alimentation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Définissez les objectifs nutritionnels de votre animal.
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Objectif principal *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {(
                    [
                      {
                        val: "maintain",
                        label: "Maintenir le poids",
                        desc: "Garder la forme et le poids idéal actuels",
                        Icon: BalanceIcon,
                      },
                      {
                        val: "lose",
                        label: "Perdre du poids",
                        desc: "Réduire progressivement la masse corporelle",
                        Icon: TrendDownIcon,
                      },
                      {
                        val: "gain",
                        label: "Prendre du poids",
                        desc: "Développer la masse musculaire et prendre des forces",
                        Icon: DumbbellIcon,
                      },
                    ] as const
                  ).map(({ val, label, desc, Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update("goal", val as Goal)}
                      className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        data.goal === val
                          ? "border-petblue bg-petblue/10"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                          data.goal === val ? "bg-petblue/30" : "bg-slate-100"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${data.goal === val ? "text-petblue" : "text-slate-500"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${data.goal === val ? "text-slate-900" : "text-slate-900"}`}
                        >
                          {label}
                        </p>
                        <p className="text-sm text-slate-500">{desc}</p>
                      </div>
                      {data.goal === val && (
                        <CheckIcon className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-petblue" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Type d&apos;alimentation actuelle
                </label>
                <input
                  type="text"
                  placeholder="Ex : croquettes premium, nourriture humide, BARF..."
                  value={data.currentDiet}
                  onChange={(e) => update("currentDiet", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Budget mensuel (€)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    €
                  </span>
                  <input
                    type="number"
                    placeholder="Ex : 50"
                    min={0}
                    value={data.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Mode de vie et santé */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Mode de vie & santé
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ces informations nous permettent d&apos;affiner votre plan.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mode de vie *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "indoor", label: "Intérieur", Icon: IndoorIcon },
                      { val: "outdoor", label: "Extérieur", Icon: LeafIcon },
                      { val: "mixed", label: "Mixte", Icon: ArrowsRightLeftIcon },
                    ] as const
                  ).map(({ val, label, Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update("lifestyle", val as Lifestyle)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                        data.lifestyle === val
                          ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {[
                {
                  key: "conditions" as const,
                  label: "Pathologies connues",
                  placeholder: "Ex : diabète, problèmes rénaux, arthrite...",
                },
                {
                  key: "allergies" as const,
                  label: "Allergies alimentaires",
                  placeholder: "Ex : poulet, gluten, produits laitiers...",
                },
                {
                  key: "recentEvents" as const,
                  label: "Événements récents",
                  placeholder:
                    "Ex : récente stérilisation, changement d'environnement, stress...",
                },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {label}{" "}
                    <span className="text-slate-400">(optionnel)</span>
                  </label>
                  <textarea
                    placeholder={placeholder}
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                Retour
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                Accueil
              </Link>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext() || generating}
              className="flex items-center gap-2 rounded-xl bg-petblue px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm shadow-petblue/30 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {generating ? "Génération…" : step === 3 ? "Générer mon plan →" : "Continuer →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
