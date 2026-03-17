// --- Tipos para autenticación ---
export interface LoginData {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  token: string;
}
// Estados de cocción (brew)
export const BREW_STATUS = {
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
} as const;
// Unidades de medida (deben coincidir con el backend y la base de datos)
export const UNIT_LITERS = 'l';
export const UNIT_GRAMS = 'g';
export type UnitOfMeasure = typeof UNIT_LITERS | typeof UNIT_GRAMS;
export type IngredientType = 'malt' | 'hop' | 'yeast' | 'other'

export interface Ingredient {
  id: string
  name: string
  type: IngredientType
  unitOfMeasure: UnitOfMeasure
  stock: number
  reorderThreshold?: number
  isInStock: boolean
  deletedAt: string | null
}

export interface RecipeIngredientEntry {
  ingredientId: string
  quantity: number
  usageMoment: string | null
  time?: number | null
  timeUnit?: string | null
  ingredientName?: string
  ingredientStock?: number
}

export interface RecipeDetails {
  mashingTimeMinutes: number | null
  mashingTempC: number | null
  fermentationDays: number | null
  fermentationTempC: number | null
  notes: string
  og?: number | null
  fg?: number | null
  mashWater?: number | null
  spargeWater?: number | null
}

export interface Recipe {
  id: string
  name: string
  batchLiters: number
  style: Style | null
  styleId?: string | null
  ibu: number
  colorSrm: number
  alcoholPercent: number
  details: RecipeDetails
  ingredients: RecipeIngredientEntry[]
  deletedAt: string | null
}

export interface BrewIngredientSnapshot {
  ingredientId: string
  quantityUsed: number
}

export interface Brew {
  id: string
  recipeId: string
  recipeName: string
  batchLiters: number
  // Allow both 'done' and legacy 'finished' statuses used by existing service
  status: 'in_progress' | 'done' | 'finished' | 'cancelled'
  brewDate: string | Date
  bottlingDate: string | Date | null
  notes?: string
  ingredientsSnapshot: BrewIngredientSnapshot[]
}

export interface Style {
  id: string
  name: string
  deletedAt: string | null
}
