"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon, ChartBarIcon } from "../../_components/Icons";
import { supabase } from "../../_lib/supabase";
import { getAllPlans } from "../../_lib/db";
import type { NutritionPlan } from "../../_lib/types";

const GOAL_LABELS: Record<string, string> = {
  maintain: "Maintenir le poids",
  lose: "Perdre du poids",
  gain: "Prendre du poids",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type PlanEntry = { id: string; created_at: string; contenu: NutritionPlan };

export default function HistoriquePage() {
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const data = await getAllPlans(user.id);
      setPlans(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-petblue" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Historique</h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi de l&apos;évolution des plans nutritionnels de votre animal.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ClockIcon className="h-7 w-7 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">Aucun plan généré pour le moment.</p>
          <p className="mt-1 text-sm text-slate-400">
            Complétez le questionnaire pour générer votre premier plan nutritionnel.
          </p>
          <Link
            href="/questionnaire"
            className="mt-5 rounded-xl bg-petblue px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-petblue/80"
          >
            Faire le questionnaire →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-900">{plans.length}</div>
              <div className="mt-0.5 text-xs text-slate-400">Plans générés</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-900">
                {plans[0]?.contenu.calories_journalieres ?? "—"} kcal
              </div>
              <div className="mt-0.5 text-xs text-slate-400">Calories actuelles</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm sm:col-span-1">
              <div className="text-xl font-bold text-slate-900">
                {plans[0]?.contenu.repas.length ?? "—"}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">Repas/jour (actuel)</div>
            </div>
          </div>

          {/* History timeline */}
          <div className="space-y-4">
            {plans.map((entry, i) => (
              <div
                key={entry.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
                  i === 0 ? "border-petblue/40" : "border-slate-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    i === 0 ? "bg-petblue/20" : "bg-slate-100"
                  }`}>
                    <ClockIcon className={`h-5 w-5 ${i === 0 ? "text-petblue" : "text-slate-400"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {i === 0 ? "Plan actuel" : `Plan #${plans.length - i}`}
                      </p>
                      {i === 0 && (
                        <span className="rounded-full bg-petblue/20 px-2 py-0.5 text-xs font-medium text-slate-700">
                          Actuel
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(entry.created_at)}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{entry.contenu.resume}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    {entry.contenu.calories_journalieres} kcal/j
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                    {entry.contenu.repas.length} repas/j
                  </span>
                  {entry.contenu.complements.length > 0 && (
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {entry.contenu.complements.length} complément{entry.contenu.complements.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-5 w-5 flex-shrink-0 text-petblue" />
              <p className="text-sm font-medium text-slate-700">
                Consultez le plan nutritionnel actuel de votre animal
              </p>
            </div>
            <Link
              href="/dashboard/plan"
              className="rounded-xl bg-petblue px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition-all hover:bg-petblue/80"
            >
              Voir le plan
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
