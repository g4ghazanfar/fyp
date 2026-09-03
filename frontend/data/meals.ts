import { apiRequest } from "@/data/api";

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "drink";

export interface Meal {
  id: string;
  name: string;
  nameUrdu: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: MealCategory;
  tags: string[];
  allergens: string[];
  image: any;
  restaurant: string;
  rating: number;
  reviews: number;
  prepTime: number;
  isHealthy: boolean;
  healthScore: number;
  suitableFor: string[];
  ingredients: string[];
  instructions: string;
  matchReason: string;
}

export const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Snack", "Drink"] as const;

export async function getMeals(): Promise<Meal[]> {
  const response = await apiRequest<{ meals: Meal[] }>("/meals");
  return response.meals;
}

export async function getRecommendedMeals(userId: string): Promise<Meal[]> {
  const response = await apiRequest<{ meals: Meal[] }>(`/meals/recommended?userId=${encodeURIComponent(userId)}`);
  return response.meals;
}

export async function getMeal(id: string): Promise<Meal> {
  const response = await apiRequest<{ meal: Meal }>(`/meals/${encodeURIComponent(id)}`);
  return response.meal;
}