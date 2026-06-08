"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../_lib/supabase";
import {
  CheckCircleIcon,
  ShieldIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
} from "../../_components/Icons";

export default function ParametresPage() {
  const router = useRouter();
  const [email, setEmail] = useState("—");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      } else {
        // Admin fallback
        const raw = localStorage.getItem("petnutri_session");
        if (raw) {
          try {
            const session = JSON.parse(raw) as { email?: string };
            setEmail(session.email ?? "—");
          } catch { /* ignore */ }
        }
      }
      setSubscribed(
        localStorage.getItem("petnutri_subscribed") === "true" ||
          sessionStorage.getItem("petnutri_subscribed") === "true",
      );
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("petnutri_session");
    localStorage.removeItem("petnutri_data");
    localStorage.removeItem("petnutri_subscribed");
    localStorage.removeItem("petnutri_photo");
    sessionStorage.clear();
    // Clear admin bypass cookie
    document.cookie = "petnutri_admin=; path=/; max-age=0";
    router.push("/");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations de votre compte et votre abonnement.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <UserIcon className="h-5 w-5 text-petblue" />
            Compte
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Adresse email
              </label>
              <input type="email" value={email} readOnly className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Mot de passe
              </label>
              <input
                type="password"
                value="••••••••••••"
                readOnly
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Réinitialisation via le formulaire de connexion (
                <a href="/auth" className="underline hover:text-slate-600">
                  /auth
                </a>
                ).
              </p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <ShieldIcon className="h-5 w-5 text-petblue" />
            Abonnement
          </h2>

          {subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-petblue/30 bg-petblue/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-petblue" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Plan PetNutri — 9,99 €/mois
                    </p>
                    <p className="text-xs text-slate-500">
                      Abonnement actif · Résiliable à tout moment
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {[
                  "Plan nutritionnel complet et personnalisé",
                  "Tableau de bord avec suivi mensuel",
                  "Liste de courses mensuelle détaillée",
                  "Mise à jour instantanée après modification du profil",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-petblue" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs text-slate-400">
                  La gestion de l&apos;abonnement sera disponible une fois Stripe
                  configuré.
                </p>
                <button
                  disabled
                  className="cursor-not-allowed rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-400"
                >
                  Gérer via Stripe →
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="font-medium text-slate-700">Aucun abonnement actif</p>
              <p className="mt-1 text-sm text-slate-500">
                Complétez le questionnaire et souscrivez pour accéder au plan
                complet.
              </p>
            </div>
          )}
        </div>

        {/* Session */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <SettingsIcon className="h-5 w-5 text-petblue" />
            Session
          </h2>
          <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <div>
              <p className="font-medium text-slate-800">Se déconnecter</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Déconnecte la session Supabase et efface les données locales.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm ring-1 ring-red-200 transition-all hover:bg-red-50"
            >
              <LogOutIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
