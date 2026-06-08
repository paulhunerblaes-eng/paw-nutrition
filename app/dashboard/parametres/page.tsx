"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../_lib/supabase";
import {
  CheckCircleIcon,
  ShieldIcon,
  LogOutIcon,
  UserIcon,
  TriangleAlertIcon,
} from "../../_components/Icons";

export default function ParametresPage() {
  const router = useRouter();
  const [email, setEmail] = useState("—");
  const [subscribed, setSubscribed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "—");

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscribed")
        .eq("id", user.id)
        .maybeSingle();

      setSubscribed((profile as { is_subscribed?: boolean } | null)?.is_subscribed ?? false);
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        setDeleteError(json.error ?? "Une erreur est survenue. Veuillez réessayer.");
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/");
    } catch {
      setDeleteError("Erreur réseau. Veuillez réessayer.");
      setDeleting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        setCancelError(json.error ?? "Une erreur est survenue. Veuillez réessayer.");
        return;
      }
      setCancelled(true);
    } catch {
      setCancelError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations de votre compte et votre abonnement.
        </p>
      </div>

      <div className="space-y-6">
        {/* Mon compte */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <UserIcon className="h-5 w-5 text-petblue" />
            Mon compte
          </h2>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-800">Se déconnecter</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Déconnecte la session et efface les données locales.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm ring-1 ring-red-200 transition-all hover:bg-red-50 sm:justify-start"
            >
              <LogOutIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Gérer mon abonnement */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <ShieldIcon className="h-5 w-5 text-petblue" />
            Gérer mon abonnement
          </h2>

          {cancelled ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm text-green-800">
                  Votre abonnement sera résilié à la fin de la période en cours. Vous conservez
                  votre accès jusqu&apos;à la date de renouvellement.
                </p>
              </div>
            </div>
          ) : subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-petblue/30 bg-petblue/5 px-5 py-4">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-petblue" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Plan PetNutri — 9,99 €/mois
                  </p>
                  <p className="text-xs text-slate-500">Abonnement actif · Résiliable à tout moment</p>
                </div>
              </div>

              {cancelError && (
                <div className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  {cancelError}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs text-slate-400">
                  La résiliation prend effet immédiatement. Vous conserverez l&apos;accès jusqu&apos;à
                  la fin de la période en cours.
                </p>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                      Résiliation en cours…
                    </>
                  ) : (
                    "Résilier mon abonnement"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="font-medium text-slate-700">Aucun abonnement actif</p>
              <p className="mt-1 text-sm text-slate-500">
                Complétez le questionnaire et souscrivez pour accéder au plan complet.
              </p>
            </div>
          )}
        </div>
        {/* Zone dangereuse */}
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-red-600">
            <TriangleAlertIcon className="h-5 w-5" />
            Zone dangereuse
          </h2>

          <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-800">Supprimer mon compte</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Supprime définitivement votre compte, vos données et votre abonnement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="min-h-[44px] rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <TriangleAlertIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Supprimer mon compte</h3>
            </div>

            <p className="mb-2 text-sm text-slate-700">
              Êtes-vous sûr ? <span className="font-semibold text-slate-900">Cette action est irréversible.</span>
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Toutes vos données seront supprimées : profil, plan nutritionnel, animal, et abonnement Stripe si actif.
            </p>

            {deleteError && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteError(null); }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-white" />
                    Suppression…
                  </span>
                ) : (
                  "Supprimer définitivement"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
