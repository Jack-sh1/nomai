export interface Macro {
  protein: number;
  carbs: number;
  fat: number;
}

export interface Dish {
  id: string;
  name: string;
  amount: string;
  calories: number;
  macros: Macro;
}

export interface Meal {
  id: string;
  type: string;
  time: string;
  dishes: Dish[];
}

export interface UserProfile {
  weight: number;
  targetCalories: number;
  targetMacros: Macro;
}
