"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../_lib/supabase";
import { upsertAnimal } from "../../_lib/db";
import { PawPrintIcon } from "../../_components/Icons";
import type { QuestionnaireData } from "../../_lib/types";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;

        const raw = sessionStorage.getItem("petnutri_data");
        if (raw) {
          try {
            const data = JSON.parse(raw) as QuestionnaireData;
            await upsertAnimal(data, uid);
            localStorage.setItem("petnutri_data", raw);
            sessionStorage.removeItem("petnutri_data");
          } catch { /* ignore */ }
        }

        const { data: plan } = await supabase
          .from("plans")
          .select("id")
          .eq("user_id", uid)
          .limit(1)
          .maybeSingle();

        router.replace(plan ? "/dashboard/plan" : "/questionnaire");
      } else {
        router.replace("/auth");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-petblue/10">
      <div className="flex flex-col items-center gap-4 text-center">
        <PawPrintIcon className="h-10 w-10 animate-pulse text-petblue" />
        <p className="text-sm font-medium text-slate-600">Connexion en cours…</p>
      </div>
    </div>
  );
}
