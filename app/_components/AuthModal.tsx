"use client";

import { useState } from "react";
import { PawPrintIcon, LockOpenIcon } from "./Icons";
import { supabase } from "../_lib/supabase";

interface Props {
  onSuccess: (userId: string) => void;
  onClose: () => void;
}

export function AuthModal({ onSuccess, onClose }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Chargement…");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    setLoadingMsg(tab === "signup" ? "Création du compte…" : "Connexion…");

    try {
      if (tab === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        if (data.session?.user) {
          const uid = data.session.user.id;
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .upsert({ id: uid, email }, { onConflict: "id" })
            .select();
          console.log("[AuthModal] profiles upsert data:", profileData, "error:", profileError);
          onSuccess(uid);
        } else {
          setInfo("Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.session?.user) onSuccess(data.session.user.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      if (msg.includes("Invalid login credentials")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("User already registered")) setError("Un compte existe déjà avec cet email. Connectez-vous.");
      else if (msg.includes("Password should be at least")) setError("Le mot de passe doit contenir au moins 6 caractères.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7">
          <div className="flex items-center gap-2">
            <PawPrintIcon className="h-6 w-6 text-petblue" />
            <span className="text-lg font-bold text-slate-900">
              Pet<span className="text-petblue">Nutri</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8 pt-5">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            {(
              [
                { val: "signup" as const, label: "Créer un compte" },
                { val: "login" as const, label: "Se connecter" },
              ]
            ).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => { setTab(val); setError(null); setInfo(null); }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  tab === val
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "signup" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-petblue/10 p-4">
              <LockOpenIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-petblue" />
              <div>
                <p className="text-sm font-medium text-slate-800">Accédez à votre plan nutritionnel</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Créez votre compte pour remplir le questionnaire et générer votre plan personnalisé.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-xl border border-petblue/20 bg-petblue/10 px-4 py-3 text-sm text-slate-700">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Prénom</label>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Adresse email</label>
              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
              <input
                type="password"
                placeholder={tab === "signup" ? "Minimum 6 caractères" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  {loadingMsg}
                </span>
              ) : tab === "signup" ? (
                "Créer mon compte →"
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>

          {tab === "signup" && (
            <p className="mt-4 text-center text-xs text-slate-400">
              En créant un compte, vous acceptez nos{" "}
              <a href="#" className="underline hover:text-slate-600">CGU</a>{" "}
              et notre{" "}
              <a href="#" className="underline hover:text-slate-600">politique de confidentialité</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
