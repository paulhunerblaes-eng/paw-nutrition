"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionnaireData } from "../_lib/types";
import { PawPrintIcon, LockClosedIcon, CheckCircleIcon } from "../_components/Icons";

const ADMIN_EMAIL = "admin@petnutri.com";
const ADMIN_PASSWORD = "petnutri2024";

const ADMIN_DATA: QuestionnaireData = {
  name: "Max",
  animalType: "dog",
  breed: "Labrador",
  size: "large",
  age: "3 ans",
  weight: "30",
  sex: "male",
  sterilized: false,
  activityLevel: "high",
  goal: "maintain",
  currentDiet: "Croquettes premium",
  budget: "60",
  lifestyle: "mixed",
  conditions: "",
  allergies: "",
  recentEvents: "",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("petnutri_session", JSON.stringify({ email: ADMIN_EMAIL, role: "admin" }));
      localStorage.setItem("petnutri_data", JSON.stringify(ADMIN_DATA));
      localStorage.setItem("petnutri_subscribed", "true");
      // Cookie used by middleware to bypass Supabase auth check
      document.cookie = "petnutri_admin=1; path=/; max-age=86400; SameSite=Lax";
      router.push("/dashboard");
    } else {
      setError(true);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-petblue/20">
            <LockClosedIcon className="h-6 w-6 text-petblue" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Accès administrateur</h1>
          <p className="mt-1 text-sm text-slate-400">Accès local uniquement — non visible en production</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-petblue/10 p-3.5">
            <PawPrintIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-petblue" />
            <p className="text-xs text-slate-600">
              Connexion avec <strong>Max le Labrador</strong> — abonnement actif, plan complet débloqué.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
                className={inputClass}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={inputClass}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
                Identifiants incorrects.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-petblue py-3 font-semibold text-slate-900 shadow-sm shadow-petblue/30 transition-all hover:bg-petblue/80"
            >
              Accéder au dashboard →
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Données de test injectées
          </p>
          <div className="space-y-1.5 text-xs text-slate-600">
            {[
              ["Animal", "Max — Labrador mâle, 3 ans, 30 kg"],
              ["Activité", "Élevée"],
              ["Objectif", "Maintenir le poids"],
              ["Abonnement", "Actif — plan complet débloqué"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-petblue" />
                <span><span className="font-medium text-slate-700">{k} :</span> {v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
