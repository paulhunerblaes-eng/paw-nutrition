"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PawPrintIcon, CheckIcon } from "./Icons";

const BENEFITS = [
  "Plan nutritionnel 100% personnalisé pour votre animal",
  "Tableau de bord complet avec suivi mensuel",
  "Liste de courses et budget optimisé",
  "Compléments et recommandations détaillées",
  "Mises à jour du plan incluses",
];

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const { createClient } = await import("../_lib/supabase");
      const supabase = createClient();

      // Stripe success redirect — update Supabase BEFORE redirecting so the
      // new SubscriptionGate on /dashboard/plan sees is_subscribed = true.
      if (window.location.search.includes("success=true")) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("profiles")
              .update({ is_subscribed: true })
              .eq("id", user.id);
            localStorage.setItem("petnutri_subscribed", "true");
          }
        } catch { /* best-effort */ }
        setSubscribed(true);
        setChecked(true);
        router.replace("/dashboard/plan");
        return;
      }

      // Always query Supabase — never trust localStorage alone
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_subscribed")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.is_subscribed) {
            localStorage.setItem("petnutri_subscribed", "true");
            setSubscribed(true);
          } else {
            localStorage.removeItem("petnutri_subscribed");
            setSubscribed(false);
          }
        }
      } catch { /* supabase unavailable */ }

      setChecked(true);
    }
    check();
  }, [router]);

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Erreur lors de la création du paiement.");
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Invisible while checking — avoids flash
  if (!checked) return null;

  // Subscribed: render normally
  if (subscribed) return <>{children}</>;

  // Not subscribed: blur content + uncloseable modal
  return (
    <>
      {/* Page content — blurred and non-interactive */}
      <div
        aria-hidden="true"
        style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}
      >
        {children}
      </div>

      {/* Fixed paywall modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
          {/* Header band */}
          <div className="rounded-t-3xl bg-petblue/10 px-8 pt-8 pb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex items-center gap-2">
                <PawPrintIcon className="h-7 w-7 text-petblue" />
                <span className="text-xl font-bold text-slate-900">
                  Pet<span className="text-petblue">Nutri</span>
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Débloquez votre accès complet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Accédez à votre plan nutritionnel personnalisé, votre tableau de bord et toutes les fonctionnalités
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Price */}
            <div className="mb-5 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-slate-900">6,99</span>
              <span className="text-xl font-semibold text-slate-600">€</span>
              <span className="ml-1 text-sm text-slate-400">/mois</span>
            </div>

            {/* Benefits */}
            <ul className="mb-6 space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-petblue/20">
                    <CheckIcon className="h-2.5 w-2.5 text-petblue" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-petblue py-4 text-base font-bold text-slate-900 shadow-lg shadow-petblue/25 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                  Redirection…
                </>
              ) : (
                "S'abonner maintenant →"
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Paiement sécurisé par Stripe • Résiliable à tout moment
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
