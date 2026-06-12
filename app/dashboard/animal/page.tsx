"use client";

import { useEffect, useRef, useState } from "react";
import {
  type QuestionnaireData,
  type AnimalType,
  type Size,
  type Sex,
  type ActivityLevel,
  type Goal,
  type Lifestyle,
  defaultQuestionnaireData,
} from "../../_lib/types";
import { supabase } from "../../_lib/supabase";
import { getAnimal, upsertAnimal } from "../../_lib/db";
import {
  DogIcon,
  CatIcon,
  BalanceIcon,
  TrendDownIcon,
  DumbbellIcon,
  IndoorIcon,
  LeafIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  PawPrintIcon,
  CameraIcon,
  SparklesIcon,
} from "../../_components/Icons";

const SAVE_STEPS = ["Mise à jour du profil…", "Régénération de votre plan…"];
const SAVE_PROGRESS = [40, 85];

function SavingOverlay({ phase }: { phase: number }) {
  const progress = SAVE_PROGRESS[Math.min(phase - 1, SAVE_PROGRESS.length - 1)] ?? 10;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="relative mb-8 h-20 w-20">
          <div
            className="animate-spin-slow absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, #90D5FF 0%, #90D5FF 65%, rgba(144,213,255,0.08) 82%, transparent 100%)" }}
          />
          <div className="absolute inset-[5px] rounded-full bg-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrintIcon className="animate-pulse-soft h-8 w-8 text-petblue" />
          </div>
        </div>

        <h2 className="mb-6 text-base font-semibold text-slate-800">
          {SAVE_STEPS[phase - 1] ?? "Traitement en cours…"}
        </h2>

        <div className="mb-6 w-full space-y-3">
          {SAVE_STEPS.map((label, i) => {
            const state = i < phase - 1 ? "done" : i === phase - 1 ? "pending" : "hidden";
            return (
              <div key={label} className={`flex items-center gap-3 transition-all duration-500 ${state === "hidden" ? "opacity-0" : "opacity-100"}`}>
                <div className={`h-2 w-2 flex-shrink-0 rounded-full ${state === "done" ? "bg-petblue" : state === "pending" ? "animate-pulse bg-petblue/50" : "bg-slate-200"}`} />
                <span className={`flex-1 text-left text-sm ${state === "done" ? "font-medium text-slate-800" : "text-slate-400"}`}>{label}</span>
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {state === "pending" && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-petblue/20 border-t-petblue" />}
                  {state === "done" && <CheckIcon className="h-4 w-4 text-petblue" />}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-4 text-xs text-slate-400">Cela peut prendre quelques secondes</p>

        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-petblue transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20 min-h-[44px]";

export default function AnimalPage() {
  const [data, setData] = useState<QuestionnaireData>(defaultQuestionnaireData);
  const [saving, setSaving] = useState(false);
  const [savingPhase, setSavingPhase] = useState(0);
  const [saved, setSaved] = useState(false);
  const [planRegenerated, setPlanRegenerated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const animal = await getAnimal(user.id);
        if (animal) {
          setData(animal);
          setLoaded(true);
          setPhoto(localStorage.getItem("petnutri_photo"));
          return;
        }
      }
      // Admin / unauthenticated fallback
      const raw =
        localStorage.getItem("petnutri_data") ??
        sessionStorage.getItem("petnutri_data");
      if (raw) {
        try { setData(JSON.parse(raw) as QuestionnaireData); } catch { /* ignore */ }
      }
      setPhoto(localStorage.getItem("petnutri_photo"));
      setLoaded(true);
    }
    load();
  }, []);

  const update = <K extends keyof QuestionnaireData>(
    key: K,
    value: QuestionnaireData[K],
  ) => {
    setSaved(false);
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhoto(result);
      localStorage.setItem("petnutri_photo", result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    localStorage.removeItem("petnutri_photo");
    if (fileRef.current) fileRef.current.value = "";
  };

  const weightInvalid = !data.weight || data.weight === "" || data.weight === "0" || isNaN(parseFloat(data.weight)) || parseFloat(data.weight) <= 0;

  const handleSave = async () => {
    console.log("handleSave appelé");
    if (weightInvalid) return;
    setSaving(true);
    setSavingPhase(1);
    setPlanRegenerated(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await upsertAnimal(data, user.id);
      setSavingPhase(2);
      try {
        console.log("Appel generate-plan avec:", JSON.stringify(data).slice(0, 200));
        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) setPlanRegenerated(true);
      } catch { /* ignore — plan stays as-is */ }
    }
    const json = JSON.stringify(data);
    localStorage.setItem("petnutri_data", json);
    sessionStorage.setItem("petnutri_data", json);
    setSaving(false);
    setSavingPhase(0);
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!loaded) return null;

  const isDog = data.animalType !== "cat";
  const PetIcon = isDog ? DogIcon : CatIcon;


  return (
    <div>
      {saving && <SavingOverlay phase={savingPhase} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mon animal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Modifiez les informations de votre animal pour mettre à jour son plan nutritionnel.
        </p>
      </div>

      {saved && (
        <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${planRegenerated ? "border-green-200 bg-green-50" : "border-petblue/40 bg-petblue/10"}`}>
          <CheckCircleIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${planRegenerated ? "text-green-500" : "text-petblue"}`} />
          <div>
            <p className={`font-semibold ${planRegenerated ? "text-green-800" : "text-slate-800"}`}>
              {planRegenerated ? "Votre plan a été régénéré avec les nouvelles informations" : "Profil mis à jour !"}
            </p>
            <p className={`mt-0.5 text-sm ${planRegenerated ? "text-green-700" : "text-slate-600"}`}>
              {planRegenerated
                ? "Rendez-vous sur la page Mon Plan pour consulter vos nouvelles recommandations nutritionnelles."
                : "Vos nouvelles informations ont bien été enregistrées."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Photo + Nom */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <PawPrintIcon className="h-5 w-5 text-petblue" />
            Identité
          </h2>

          <div className="mb-5 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={data.name || "Animal"}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-petblue/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-petblue/10">
                  <PetIcon className="h-9 w-9 text-petblue" />
                </div>
              )}
              <label
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-petblue shadow-sm transition-all hover:bg-petblue/80"
                title="Changer la photo"
              >
                <CameraIcon className="h-3.5 w-3.5 text-slate-900" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhoto}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Photo de profil</p>
              <p className="mt-0.5 text-xs text-slate-400">
                JPG, PNG ou WEBP. Stockée localement dans le navigateur.
              </p>
              {photo && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="mt-1.5 text-xs text-slate-400 underline hover:text-red-500"
                >
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nom de l&apos;animal
            </label>
            <input
              type="text"
              placeholder="Ex : Max, Luna, Simba..."
              value={data.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Profil */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-bold text-slate-900">Profil de l&apos;animal</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Type d&apos;animal</label>
              <div className="flex gap-3">
                {(
                  [
                    { val: "dog", label: "Chien", Icon: DogIcon },
                    { val: "cat", label: "Chat", Icon: CatIcon },
                  ] as const
                ).map(({ val, label, Icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("animalType", val as AnimalType)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                      data.animalType === val
                        ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Race</label>
              <input
                type="text"
                placeholder="Ex : Labrador, Maine Coon..."
                value={data.breed}
                onChange={(e) => update("breed", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Taille</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { val: "small", label: "Petit" },
                    { val: "medium", label: "Moyen" },
                    { val: "large", label: "Grand" },
                    { val: "giant", label: "Géant" },
                  ] as const
                ).map(({ val, label }) => (
                  <ToggleButton
                    key={val}
                    active={data.size === val}
                    onClick={() => update("size", val as Size)}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Âge</label>
                <input
                  type="text"
                  placeholder="Ex : 3 ans, 6 mois"
                  value={data.age}
                  onChange={(e) => update("age", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Poids (kg) *</label>
                <input
                  type="number"
                  placeholder="Ex : 12"
                  min={0.1}
                  step={0.1}
                  value={data.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  className={
                    weightInvalid && data.weight !== undefined
                      ? "w-full rounded-xl border border-red-400 px-4 py-3 text-sm outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-200 min-h-[44px]"
                      : inputClass
                  }
                />
                {weightInvalid && data.weight !== undefined && (
                  <p className="mt-1 text-xs text-red-500">Le poids est obligatoire et doit être supérieur à 0</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sexe</label>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { val: "male", label: "Mâle" },
                    { val: "female", label: "Femelle" },
                  ] as const
                ).map(({ val, label }) => (
                  <ToggleButton
                    key={val}
                    active={data.sex === val}
                    onClick={() => update("sex", val as Sex)}
                  >
                    {label}
                  </ToggleButton>
                ))}
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={data.sterilized}
                    onChange={(e) => update("sterilized", e.target.checked)}
                    className="h-4 w-4 rounded accent-petblue"
                  />
                  Stérilisé(e)
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Niveau d&apos;activité
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { val: "low", label: "Faible" },
                    { val: "moderate", label: "Modéré" },
                    { val: "high", label: "Élevé" },
                    { val: "very_high", label: "Très élevé" },
                  ] as const
                ).map(({ val, label }) => (
                  <ToggleButton
                    key={val}
                    active={data.activityLevel === val}
                    onClick={() => update("activityLevel", val as ActivityLevel)}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-bold text-slate-900">Objectifs & alimentation</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Objectif principal</label>
              <div className="grid grid-cols-1 gap-3">
                {(
                  [
                    { val: "maintain", label: "Maintenir le poids", desc: "Garder la forme et le poids idéal actuels", Icon: BalanceIcon },
                    { val: "lose", label: "Perdre du poids", desc: "Réduire progressivement la masse corporelle", Icon: TrendDownIcon },
                    { val: "gain", label: "Prendre du poids", desc: "Développer la masse musculaire et prendre des forces", Icon: DumbbellIcon },
                  ] as const
                ).map(({ val, label, desc, Icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("goal", val as Goal)}
                    className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      data.goal === val
                        ? "border-petblue bg-petblue/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${data.goal === val ? "bg-petblue/30" : "bg-slate-100"}`}>
                      <Icon className={`h-5 w-5 ${data.goal === val ? "text-petblue" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{label}</p>
                      <p className="text-sm text-slate-500">{desc}</p>
                    </div>
                    {data.goal === val && <CheckIcon className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-petblue" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Alimentation actuelle</label>
              <input
                type="text"
                placeholder="Ex : croquettes premium, nourriture humide, BARF..."
                value={data.currentDiet}
                onChange={(e) => update("currentDiet", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Budget mensuel (€)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
                <input
                  type="number"
                  placeholder="Ex : 50"
                  min={0}
                  value={data.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mode de vie */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-bold text-slate-900">Mode de vie & santé</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mode de vie</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { val: "indoor", label: "Intérieur", Icon: IndoorIcon },
                    { val: "outdoor", label: "Extérieur", Icon: LeafIcon },
                    { val: "mixed", label: "Mixte", Icon: ArrowsRightLeftIcon },
                  ] as const
                ).map(({ val, label, Icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("lifestyle", val as Lifestyle)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      data.lifestyle === val
                        ? "border-petblue bg-petblue/20 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { key: "conditions" as const, label: "Pathologies connues", placeholder: "Ex : diabète, problèmes rénaux, arthrite..." },
              { key: "allergies" as const, label: "Allergies alimentaires", placeholder: "Ex : poulet, gluten, produits laitiers..." },
              { key: "recentEvents" as const, label: "Événements récents", placeholder: "Ex : récente stérilisation, changement d'environnement, stress..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {label} <span className="text-slate-400">(optionnel)</span>
                </label>
                <textarea
                  placeholder={placeholder}
                  value={data[key]}
                  onChange={(e) => update(key, e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-petblue focus:ring-2 focus:ring-petblue/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || weightInvalid}
            className="w-full rounded-2xl bg-petblue py-4 font-semibold text-slate-900 shadow-lg shadow-petblue/30 transition-all hover:bg-petblue/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                Enregistrement et régénération…
              </span>
            ) : (
              "Mettre à jour mon plan →"
            )}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            4 mises à jour de votre plan incluses par mois (1 par semaine)
          </p>
        </div>
      </div>
    </div>
  );
}
