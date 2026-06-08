"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrintIcon } from "./Icons";
import { AuthModal } from "./AuthModal";
import { supabase } from "../_lib/supabase";
import { getPostLoginRoute } from "../_lib/redirect";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDashboard = async () => {
    router.push(await getPostLoginRoute());
  };

  const handleAuthSuccess = async (userId: string) => {
    setShowAuthModal(false);
    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    router.push(plan ? "/dashboard/plan" : "/questionnaire");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrintIcon className="h-6 w-6 text-petblue" />
            <span className="text-xl font-bold text-slate-900">
              Pet<span className="text-petblue">Nutri</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Comment ça marche
            </Link>
            <Link
              href="/#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Tarifs
            </Link>

            {loggedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleDashboard}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Mon dashboard
                </button>
                <a
                  href="/api/signout"
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Se déconnecter
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Connexion
                </Link>
                <Link
                  href="/questionnaire"
                  className="rounded-full bg-petblue px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-petblue/30 transition-colors hover:bg-petblue/80"
                >
                  Créer mon plan
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          {loggedIn ? (
            <a
              href="/api/signout"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 md:hidden"
            >
              Déconnexion
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
            >
              Connexion
            </button>
          )}
        </nav>
      </header>

      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
