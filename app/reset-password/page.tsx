"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrintIcon } from "../_components/Icons";
import { supabase } from "../_lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [view, setView] = useState<"loading" | "form" | "success" | "invalid">("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("form");
      }
    });

    // If the user already has a recovery session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setView((v) => v === "loading" ? "form" : v);
      else {
        const timer = setTimeout(() => {
          setView((v) => v === "loading" ? "invalid" : v);
        }, 4000);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setView("success");
      setTimeout(() => router.push("/dashboard/plan"), 2500);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-petblue/10 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <PawPrintIcon className="h-7 w-7 text-petblue" />
            <span className="text-2xl font-bold text-slate-900">
              Pet<span className="text-petblue">Nutri</span>
            </span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100">
          {view === "loading" && (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-petblue" />
              <p className="text-sm text-slate-500">Vérification du lien…</p>
            </div>
          )}

          {view === "invalid" && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Lien invalide ou expiré</h2>
              <p className="mb-6 text-sm text-slate-500">
                Ce lien de réinitialisation n&apos;est plus valide. Veuillez en demander un nouveau.
              </p>
              <Link
                href="/auth"
                className="inline-block rounded-xl bg-petblue px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-petblue/80"
              >
                Retour à la connexion
              </Link>
            </div>
          )}

          {view === "success" && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-petblue/10">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-petblue" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Mot de passe mis à jour !</h2>
              <p className="text-sm text-slate-500">Redirection vers votre dashboard…</p>
            </div>
          )}

          {view === "form" && (
            <>
              <h2 className="mb-1 text-xl font-bold text-slate-900">Nouveau mot de passe</h2>
              <p className="mb-6 text-sm text-slate-500">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>

              {error && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-petblue py-3.5 font-semibold text-slate-900 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                      Mise à jour…
                    </span>
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
