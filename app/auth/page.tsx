"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrintIcon, LockOpenIcon, CheckIcon } from "../_components/Icons";
import { supabase } from "../_lib/supabase";

const SIGNUP_STEPS = [
  "Connexion en cours…",
  "Sauvegarde du profil…",
  "Accès au questionnaire…",
];
const LOGIN_STEPS = [
  "Connexion en cours…",
  "Vérification de l'abonnement…",
  "Redirection…",
];

const AUTH_PROGRESS = [15, 60, 95];

function LoadingScreen({ phase, steps }: { phase: number; steps: string[] }) {
  const progress = AUTH_PROGRESS[Math.min(phase - 1, AUTH_PROGRESS.length - 1)] ?? 5;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-petblue/5 px-6">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-10 h-28 w-28">
          <div
            className="animate-spin-slow absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, #90D5FF 0%, #90D5FF 65%, rgba(144,213,255,0.08) 82%, transparent 100%)" }}
          />
          <div className="absolute inset-0 rounded-full opacity-40" style={{ boxShadow: "0 0 32px 8px rgba(144,213,255,0.45)" }} />
          <div className="absolute inset-[7px] rounded-full bg-slate-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrintIcon className="animate-pulse-soft h-10 w-10 text-petblue" />
          </div>
        </div>

        <h2 className="mb-7 text-center text-lg font-semibold tracking-tight text-slate-800">
          {steps[(phase - 1)] ?? "Chargement…"}
        </h2>

        <div className="mb-8 w-full space-y-3.5">
          {steps.map((label, i) => {
            const state = i < phase - 1 ? "done" : i === phase - 1 ? "pending" : "hidden";
            return (
              <div
                key={label}
                className={`flex items-center gap-3 transition-all duration-500 ease-out ${state === "hidden" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
              >
                <div className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors duration-300 ${state === "done" ? "bg-petblue" : state === "pending" ? "animate-pulse bg-petblue/50" : "bg-slate-200"}`} />
                <span className={`flex-1 text-sm transition-colors duration-300 ${state === "done" ? "font-medium text-slate-800" : "text-slate-400"}`}>
                  {label}
                </span>
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {state === "pending" && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-petblue/20 border-t-petblue" />}
                  {state === "done" && <CheckIcon className="h-4 w-4 text-petblue" />}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-6 text-xs text-slate-400">Cela peut prendre quelques secondes</p>

        <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-petblue transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-400">{progress}%</p>
      </div>
    </div>
  );
}

function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [view, setView] = useState<"auth" | "forgot" | "forgot-sent">("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState(SIGNUP_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    setLoadingPhase(1);

    try {
      if (tab === "signup") {
        setLoadingSteps(SIGNUP_STEPS);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;

        if (data.session?.user) {
          const uid = data.session.user.id;
          setLoadingPhase(2);
          await supabase
            .from("profiles")
            .upsert({ id: uid, email }, { onConflict: "id" });
          setLoadingPhase(3);
          router.push("/questionnaire");
        } else {
          setLoading(false);
          setLoadingPhase(0);
          setInfo(
            "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
          );
        }
      } else {
        setLoadingSteps(LOGIN_STEPS);
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (data.session?.user) {
          const uid = data.session.user.id;
          setLoadingPhase(2);

          const { data: plan } = await supabase
            .from("plans")
            .select("id")
            .eq("user_id", uid)
            .limit(1)
            .maybeSingle();

          setLoadingPhase(3);
          await new Promise((r) => setTimeout(r, 300));

          router.push(plan ? "/dashboard/plan" : "/questionnaire");
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      if (msg.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else if (msg.includes("User already registered")) {
        setError("Un compte existe déjà avec cet email. Connectez-vous.");
      } else if (msg.includes("Password should be at least")) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError(msg);
      }
      setLoading(false);
      setLoadingPhase(0);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      forgotEmail,
      { redirectTo: "https://petnutri.fr/reset-password" },
    );
    setForgotLoading(false);
    if (resetError) setError(resetError.message);
    else setView("forgot-sent");
  };

  const openForgot = () => {
    setForgotEmail(email);
    setError(null);
    setInfo(null);
    setView("forgot");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20";

  if (loading) return <LoadingScreen phase={loadingPhase} steps={loadingSteps} />;

  if (view === "forgot" || view === "forgot-sent") {
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
            {view === "forgot-sent" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-petblue/10">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-petblue" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Email envoyé !</h2>
                <p className="mb-6 text-sm text-slate-500">
                  Un email de réinitialisation a été envoyé à{" "}
                  <span className="font-medium text-slate-700">{forgotEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => { setView("auth"); setError(null); }}
                  className="text-sm font-medium text-petblue hover:text-petblue/80"
                >
                  ← Retour à la connexion
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setView("auth"); setError(null); }}
                  className="mb-5 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Retour
                </button>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Mot de passe oublié ?</h2>
                <p className="mb-6 text-sm text-slate-500">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-xl bg-petblue py-3.5 font-semibold text-slate-900 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                        Envoi en cours…
                      </span>
                    ) : (
                      "Envoyer le lien de réinitialisation"
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
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            {(
              [
                { val: "signup", label: "Créer un compte" },
                { val: "login", label: "Se connecter" },
              ] as const
            ).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setTab(val);
                  setError(null);
                  setInfo(null);
                }}
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
                <p className="text-sm font-medium text-slate-800">
                  Accédez à votre plan nutritionnel
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Créez votre compte pour accéder au questionnaire et générer votre plan personnalisé.
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Prénom
                </label>
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Adresse email
              </label>
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder={
                  tab === "signup" ? "Minimum 6 caractères" : "••••••••"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {tab === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={openForgot}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-petblue py-3.5 font-semibold text-slate-900 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                  Chargement…
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
              <Link href="#" className="underline hover:text-slate-600">
                CGU
              </Link>{" "}
              et notre{" "}
              <Link href="#" className="underline hover:text-slate-600">
                politique de confidentialité
              </Link>
              .
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          {tab === "signup" ? (
            <>
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="font-medium text-petblue hover:text-petblue/80"
              >
                Se connecter
              </button>
            </>
          ) : (
            <>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="font-medium text-petblue hover:text-petblue/80"
              >
                Créer un compte
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-petblue/10" />}>
      <AuthForm />
    </Suspense>
  );
}
