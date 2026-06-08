export type AnimalType = "dog" | "cat";
export type Size = "small" | "medium" | "large" | "giant";
export type Sex = "male" | "female";
export type ActivityLevel = "low" | "moderate" | "high" | "very_high";
export type Goal = "maintain" | "lose" | "gain";
export type Lifestyle = "indoor" | "outdoor" | "mixed";

export interface QuestionnaireData {
  name?: string;
  animalType: AnimalType | null;
  breed: string;
  size: Size | null;
  age: string;
  weight: string;
  sex: Sex | null;
  sterilized: boolean;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  currentDiet: string;
  budget: string;
  lifestyle: Lifestyle | null;
  conditions: string;
  allergies: string;
  recentEvents: string;
}

export interface NutritionPlan {
  resume: string;
  calories_journalieres: number;
  repas: Array<{
    moment: string;
    description: string;
    quantite: string;
    horaire: string;
  }>;
  aliments_recommandes: Array<{ aliment: string; raison: string }>;
  aliments_eviter: Array<{ aliment: string; raison: string }>;
  complements: Array<{ nom: string; dosage: string; benefice: string }>;
  conseils: string[];
  avertissements: string[];
}

export const defaultQuestionnaireData: QuestionnaireData = {
  animalType: null,
  breed: "",
  size: null,
  age: "",
  weight: "",
  sex: null,
  sterilized: false,
  activityLevel: null,
  goal: null,
  currentDiet: "",
  budget: "",
  lifestyle: null,
  conditions: "",
  allergies: "",
  recentEvents: "",
};
