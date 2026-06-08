"use client";

import Link from "next/link";
import { ClockIcon, SparklesIcon, ChartBarIcon } from "../../_components/Icons";

const HISTORY = [
  {
    id: 1,
    label: "Plan initial",
    date: "15 mai 2026",
    weight: "32 kg",
    goal: "Perdre du poids",
    calories: "1 100 kcal",
    note: "Premier plan généré après le questionnaire initial.",
  },
  {
    id: 2,
    label: "Mise à jour #1",
    date: "1 juin 2026",
    weight: "31 kg",
    goal: "Perdre du poids",
    calories: "1 140 kcal",
    note: "Ajustement suite à une perte de poids trop rapide (−1 kg/semaine).",
  },
  {
    id: 3,
    label: "Mise à jour #2",
    date: "7 juin 2026",
    weight: "30 kg",
    goal: "Maintenir le poids",
    calories: "1 240 kcal",
    note: "Objectif atteint. Passage en mode maintien du poids.",
  },
];

export default function HistoriquePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Historique</h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi de l&apos;évolution des plans nutritionnels de votre animal.
        </p>
      </div>

      {/* AI notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-petblue/30 bg-petblue/5 p-4">
        <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-petblue" />
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Données de démonstration.</span>{" "}
          L&apos;historique complet et la courbe de poids seront synchronisés automatiquement une fois l&apos;API connectée.
        </p>
      </div>

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Plans générés", value: "3" },
          { label: "Poids perdu", value: "−2 kg" },
          { label: "Jours de suivi", value: "23 j" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="mt-0.5 text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* History timeline */}
      <div className="space-y-4">
        {HISTORY.slice().reverse().map((entry, i) => (
          <div
            key={entry.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm ${
              i === 0 ? "border-petblue/40" : "border-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                  i === 0 ? "bg-petblue/20" : "bg-slate-100"
                }`}>
                  <ClockIcon className={`h-5 w-5 ${i === 0 ? "text-petblue" : "text-slate-400"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{entry.label}</p>
                    {i === 0 && (
                      <span className="rounded-full bg-petblue/20 px-2 py-0.5 text-xs font-medium text-slate-700">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{entry.date}</p>
                  <p className="mt-2 text-sm text-slate-600">{entry.note}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="hidden flex-shrink-0 space-y-1 text-right sm:block">
                <p className="text-xs text-slate-400">Poids</p>
                <p className="font-semibold text-slate-900">{entry.weight}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                {entry.calories}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                {entry.goal}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                {entry.weight}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-5 w-5 text-petblue" />
          <p className="text-sm font-medium text-slate-700">
            Consultez le plan nutritionnel actuel de votre animal
          </p>
        </div>
        <Link
          href="/dashboard/plan"
          className="flex-shrink-0 rounded-xl bg-petblue px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-petblue/80"
        >
          Voir le plan
        </Link>
      </div>
    </div>
  );
}
