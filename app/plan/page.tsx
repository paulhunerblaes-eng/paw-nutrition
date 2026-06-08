"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../_components/Navbar";
import { supabase } from "../_lib/supabase";
import type { QuestionnaireData } from "../_lib/types";
import {
  CheckCircleIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  FlameIcon,
  UtensilsIcon,
  ScaleIcon,
  DropletIcon,
  ChartBarIcon,
  PillIcon,
  NoSymbolIcon,
  ListBulletIcon,
  ShoppingCartIcon,
  DogIcon,
  CatIcon,
  PawPrintIcon,
} from "../_components/Icons";

function BlurredSection({
  children,
  unlocked = false,
}: {
  children: React.ReactNode;
  unlocked?: boolean;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="select-none blur-[5px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border border-petblue/40 bg-white/90 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
          <LockClosedIcon className="mx-auto h-6 w-6 text-petblue" />
          <p className="mt-2 text-sm font-semibold text-slate-800">
            Débloque le plan complet
          </p>
        </div>
      </div>
    </div>
  );
}

function getMealPortions(
  activity: string | null | undefined,
  lifestyle: string | null | undefined,
  goal: string | null | undefined,
) {
  const highActivity = activity === "high" || activity === "very_high";
  const indoor = lifestyle === "indoor";
  const gain = goal === "gain";

  const morning = highActivity
    ? "Entre 6h30 et 8h30"
    : indoor
      ? "Entre 7h30 et 10h00"
      : "Entre 7h00 et 9h00";

  const evening = highActivity
    ? "Entre 17h30 et 19h30"
    : indoor
      ? "Entre 18h00 et 21h00"
      : "Entre 18h00 et 20h00";

  if (gain) {
    return [
      { meal: "Matin", amount: "120g", type: morning },
      { meal: "Midi", amount: "100g", type: "Entre 12h00 et 13h30" },
      { meal: "Soir", amount: "120g", type: evening },
    ];
  }
  return [
    { meal: "Matin", amount: "180g", type: morning },
    { meal: "Soir", amount: "180g", type: evening },
  ];
}

const planData = {
  daily_calories: 1240,
  portions: [] as { meal: string; amount: string; type: string }[],
  macros: [
    { label: "Protéines", value: 32, color: "bg-petblue" },
    { label: "Lipides", value: 18, color: "bg-petblue/70" },
    { label: "Glucides", value: 42, color: "bg-petblue/40" },
    { label: "Fibres", value: 8, color: "bg-slate-300" },
  ],
  supplements: ["Oméga-3", "Vitamine E", "Probiotiques"],
  recommendations: [
    "Privilégiez des sources de protéines animales de haute qualité",
    "Assurez un accès constant à de l'eau fraîche",
    "Évitez les friandises au-delà de 10% des apports journaliers",
    "Contrôle du poids toutes les 4 semaines recommandé",
    "Transition alimentaire progressive sur 7-10 jours",
  ],
  foods_to_avoid: ["Raisins", "Chocolat", "Oignons", "Xylitol"],
  shopping_list: [
    { item: "Croquettes Royal Canin Adult", qty: "3 kg/mois", price: "~28 €" },
    { item: "Pâtée premium sans céréales", qty: "12 boîtes/mois", price: "~24 €" },
    { item: "Complément oméga-3", qty: "1 flacon/mois", price: "~15 €" },
  ],
};

type StepState = "hidden" | "pending" | "done";

const LOAD_STEPS = [
  "Analyse des besoins nutritionnels",
  "Calcul des portions personnalisées",
  "Sélection des produits adaptés",
];

const PROGRESS_PCT = [5, 38, 68, 100];

function stepState(index: number, phase: number): StepState {
  if (index === 0) return phase >= 1 ? "done" : "pending";
  if (index === 1) return phase >= 2 ? "done" : phase >= 1 ? "pending" : "hidden";
  return phase >= 3 ? "done" : phase >= 2 ? "pending" : "hidden";
}

export default function PlanPage() {
  const router = useRouter();
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      localStorage.getItem("petnutri_data") ??
      sessionStorage.getItem("petnutri_data");
    if (raw) {
      try {
        setData(JSON.parse(raw) as QuestionnaireData);
      } catch { /* ignore */ }
    }
    setSubscribed(
      localStorage.getItem("petnutri_subscribed") === "true" ||
      sessionStorage.getItem("petnutri_subscribed") === "true",
    );
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setPhase(3), 4500);
    const t4 = setTimeout(() => setLoading(false), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);

    // Must be logged in to subscribe
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth?from=questionnaire");
      return;
    }

    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const json = await res.json() as { url?: string; error?: string };

      if (!res.ok || !json.url) {
        setCheckoutError(json.error ?? "Erreur lors de la création du paiement.");
        setCheckoutLoading(false);
        return;
      }

      window.location.href = json.url;
    } catch {
      setCheckoutError("Erreur réseau. Veuillez réessayer.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    const progress = PROGRESS_PCT[phase];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-petblue/5 px-6">
        <div className="flex w-full max-w-sm flex-col items-center">

          {/* Spinning gradient ring + pulsing icon */}
          <div className="relative mb-10 h-32 w-32">
            {/* Rotating conic-gradient ring */}
            <div
              className="animate-spin-slow absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #90D5FF 0%, #90D5FF 65%, rgba(144,213,255,0.08) 82%, transparent 100%)",
              }}
            />
            {/* Soft outer glow */}
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{ boxShadow: "0 0 32px 8px rgba(144,213,255,0.45)" }}
            />
            {/* Inner mask */}
            <div className="absolute inset-[7px] rounded-full bg-slate-50" />
            {/* Pulsing icon — centered, doesn't spin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <PawPrintIcon className="animate-pulse-soft h-11 w-11 text-petblue" />
            </div>
          </div>

          {/* Main label */}
          <h2 className="mb-7 text-center text-lg font-semibold tracking-tight text-slate-800">
            Nous analysons le profil de votre animal…
          </h2>

          {/* Step list */}
          <div className="mb-8 w-full space-y-3.5">
            {LOAD_STEPS.map((label, i) => {
              const state = stepState(i, phase);
              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 transition-all duration-500 ease-out ${
                    state === "hidden"
                      ? "translate-y-2 opacity-0"
                      : "translate-y-0 opacity-100"
                  }`}
                >
                  {/* Left bullet */}
                  <div
                    className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors duration-300 ${
                      state === "done"
                        ? "bg-petblue"
                        : state === "pending"
                          ? "animate-pulse bg-petblue/50"
                          : "bg-slate-200"
                    }`}
                  />
                  {/* Label */}
                  <span
                    className={`flex-1 text-sm transition-colors duration-300 ${
                      state === "done"
                        ? "font-medium text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  {/* Right indicator */}
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {state === "pending" && (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-petblue/20 border-t-petblue" />
                    )}
                    {state === "done" && (
                      <CheckIcon className="h-4 w-4 text-petblue" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
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

  const isDog = data?.animalType === "dog";
  const iscat = data?.animalType === "cat";
  const animalLabel = isDog ? "Chien" : iscat ? "Chat" : "Animal";
  const petName = data?.name || (data?.breed ? data.breed : animalLabel);
  const AnimalIcon = isDog ? DogIcon : CatIcon;
  const portions = getMealPortions(data?.activityLevel, data?.lifestyle, data?.goal);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-petblue/40 bg-petblue/10 px-4 py-1.5 text-sm font-medium text-slate-700">
              <CheckCircleIcon className="h-4 w-4 text-petblue" />
              <span>Plan généré avec succès</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Plan nutritionnel de{" "}
              <span className="text-petblue">{petName}</span>
            </h1>
            {data && (
              <div className="mt-2 flex items-center justify-center gap-2 text-slate-500">
                <AnimalIcon className="h-4 w-4" />
                <span>
                  {[data.breed, data.age && `${data.age}`, data.weight && `${data.weight} kg`]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </div>
            )}
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { Icon: FlameIcon, label: "Calories/jour", value: `${planData.daily_calories} kcal` },
              { Icon: UtensilsIcon, label: "Repas/jour", value: `${portions.length} repas` },
              { Icon: ScaleIcon, label: "Protéines", value: `${planData.macros[0].value}%` },
              { Icon: DropletIcon, label: "Eau recommandée", value: "300 ml/j" },
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

          {/* Meals plan */}
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <UtensilsIcon className="h-5 w-5 text-petblue" />
              Programme des repas
            </h2>
            <div className="space-y-3">
              {portions.map((m) => (
                <div
                  key={m.meal}
                  className="flex items-center justify-between rounded-xl bg-petblue/10 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{m.meal}</p>
                    <p className="text-xs text-slate-500">{m.type}</p>
                  </div>
                  <span className="font-semibold text-slate-800">{m.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <ChartBarIcon className="h-5 w-5 text-petblue" />
              Répartition nutritionnelle
            </h2>
            <div className="space-y-3">
              {planData.macros.map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{m.label}</span>
                    <span className="font-semibold text-slate-900">{m.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${m.color}`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blurred sections */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <BlurredSection unlocked={subscribed}>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <PillIcon className="h-5 w-5 text-petblue" />
                  Compléments recommandés
                </h2>
                <ul className="space-y-2">
                  {planData.supplements.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-petblue" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </BlurredSection>

            <BlurredSection unlocked={subscribed}>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <NoSymbolIcon className="h-5 w-5 text-red-400" />
                  Aliments à éviter
                </h2>
                <div className="flex flex-wrap gap-2">
                  {planData.foods_to_avoid.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </BlurredSection>
          </div>

          <BlurredSection unlocked={subscribed}>
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                <ListBulletIcon className="h-5 w-5 text-petblue" />
                Recommandations personnalisées
              </h2>
              <ul className="space-y-2">
                {planData.recommendations.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-petblue" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </BlurredSection>

          <BlurredSection unlocked={subscribed}>
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                <ShoppingCartIcon className="h-5 w-5 text-petblue" />
                Liste de courses mensuelle
              </h2>
              <div className="space-y-3">
                {planData.shopping_list.map((item) => (
                  <div key={item.item} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.item}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">{item.qty}</span>
                      <span className="font-semibold text-slate-900">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurredSection>

          {/* CTA — masqué pour les abonnés */}
          {subscribed ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-petblue/30 bg-petblue/10 px-6 py-4 text-sm font-medium text-slate-700">
              <CheckCircleIcon className="h-5 w-5 text-petblue" />
              Abonnement actif — plan complet débloqué
            </div>
          ) : (
            <div className="sticky bottom-6 mt-4">
              <div className="rounded-3xl bg-petblue p-6 text-center shadow-2xl shadow-petblue/30">
                <div className="flex justify-center">
                  <LockOpenIcon className="h-7 w-7 text-slate-900" />
                </div>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  Débloquez votre plan complet
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Compléments, liste de courses, recommandations détaillées et
                  suivi mensuel inclus
                </p>

                {checkoutError && (
                  <p className="mt-3 rounded-xl bg-white/80 px-4 py-2 text-xs text-red-600">
                    {checkoutError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                      Redirection…
                    </>
                  ) : (
                    "Débloquer pour 9,99 € →"
                  )}
                </button>
                <p className="mt-2 text-xs text-slate-600">
                  Paiement sécurisé par Stripe • Résiliable à tout moment
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
