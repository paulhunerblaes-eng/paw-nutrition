import { supabase } from "./supabase";
import type {
  QuestionnaireData,
  NutritionPlan,
  AnimalType,
  Size,
  Sex,
  ActivityLevel,
  Goal,
  Lifestyle,
} from "./types";

type AnimalRow = {
  id: string;
  user_id: string;
  nom: string | null;
  type: string | null;
  race: string | null;
  taille: string | null;
  age: string | null;
  poids: string | null;
  sexe: string | null;
  sterilise: boolean | null;
  niveau_activite: string | null;
  objectif: string | null;
  alimentation_actuelle: string | null;
  budget: string | null;
  mode_vie: string | null;
  pathologies: string | null;
  allergies: string | null;
  evenements_recents: string | null;
  photo_url: string | null;
};

export function dbToQuestionnaire(row: AnimalRow): QuestionnaireData {
  return {
    name: row.nom ?? undefined,
    animalType: (row.type as AnimalType) ?? null,
    breed: row.race ?? "",
    size: (row.taille as Size) ?? null,
    age: row.age ?? "",
    weight: row.poids ?? "",
    sex: (row.sexe as Sex) ?? null,
    sterilized: row.sterilise ?? false,
    activityLevel: (row.niveau_activite as ActivityLevel) ?? null,
    goal: (row.objectif as Goal) ?? null,
    currentDiet: row.alimentation_actuelle ?? "",
    budget: row.budget ?? "",
    lifestyle: (row.mode_vie as Lifestyle) ?? null,
    conditions: row.pathologies ?? "",
    allergies: row.allergies ?? "",
    recentEvents: row.evenements_recents ?? "",
  };
}

function questionnaireToDb(data: QuestionnaireData, userId: string) {
  return {
    user_id: userId,
    nom: data.name ?? null,
    type: data.animalType,
    race: data.breed || null,
    taille: data.size,
    age: data.age || null,
    poids: data.weight || null,
    sexe: data.sex,
    sterilise: data.sterilized,
    niveau_activite: data.activityLevel,
    objectif: data.goal,
    alimentation_actuelle: data.currentDiet || null,
    budget: data.budget || null,
    mode_vie: data.lifestyle,
    pathologies: data.conditions || null,
    allergies: data.allergies || null,
    evenements_recents: data.recentEvents || null,
    updated_at: new Date().toISOString(),
  };
}

export async function getAnimal(userId: string): Promise<QuestionnaireData | null> {
  const { data } = await supabase
    .from("animals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return dbToQuestionnaire(data as AnimalRow);
}

export async function getAnimalId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("animals")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function getPlan(userId: string): Promise<NutritionPlan | null> {
  const { data, error } = await supabase
    .from("plans")
    .select("contenu")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log("[getPlan] data:", data, "error:", error);
  if (!data?.contenu) return null;
  const contenu = typeof data.contenu === "string"
    ? JSON.parse(data.contenu)
    : data.contenu;
  return contenu as NutritionPlan;
}

export async function upsertPlan(
  userId: string,
  animalId: string | null,
  contenu: NutritionPlan,
): Promise<void> {
  console.log("[upsertPlan] userId:", userId);

  const { data: existing, error: selectError } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  console.log("[upsertPlan] select existing:", existing, "error:", selectError);

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("plans")
      .update({ contenu, updated_at: new Date().toISOString() })
      .eq("id", (existing as { id: string }).id)
      .select();
    console.log("[upsertPlan] update data:", updated, "error:", updateError);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("plans")
      .insert({ user_id: userId, animal_id: animalId, contenu })
      .select();
    console.log("[upsertPlan] insert data:", inserted, "error:", insertError);
  }
}

export async function upsertAnimal(
  data: QuestionnaireData,
  userId: string,
): Promise<void> {
  console.log("[upsertAnimal] userId:", userId);

  const { data: existing, error: selectError } = await supabase
    .from("animals")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  console.log("[upsertAnimal] select existing:", existing, "error:", selectError);

  const payload = questionnaireToDb(data, userId);

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("animals")
      .update(payload)
      .eq("id", (existing as { id: string }).id)
      .select();
    console.log("[upsertAnimal] update data:", updated, "error:", updateError);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("animals")
      .insert(payload)
      .select();
    console.log("[upsertAnimal] insert data:", inserted, "error:", insertError);
  }
}
