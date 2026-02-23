import { Ingredient, Recipe, Brew, Style, RecipeDetails } from '../types'

export const initialIngredients: Ingredient[] = [
  { id: 'i1', name: 'Malta Pale Ale', type: 'malt', unitOfMeasure: 'g', stock: 15000, reorderThreshold: 5000, deletedAt: null },
  { id: 'i2', name: 'Lúpulo Cascade', type: 'hop', unitOfMeasure: 'g', stock: 150, reorderThreshold: 200, deletedAt: null },
  { id: 'i3', name: 'Levadura US-05', type: 'yeast', unitOfMeasure: 'g', stock: 11.5, reorderThreshold: 10, deletedAt: null },
  { id: 'i4', name: 'Malta Cara-Pils', type: 'malt', unitOfMeasure: 'g', stock: 2500, reorderThreshold: 3000, deletedAt: null },
  { id: 'i5', name: 'Agua Filtrada', type: 'other', unitOfMeasure: 'l', stock: 9999, reorderThreshold: 100, deletedAt: null },
]

export const DEFAULT_DETAILS: RecipeDetails = {
  mashingTimeMinutes: 60,
  mashingTempC: 68,
  fermentationDays: 14,
  fermentationTempC: 20,
  notes: 'Notas de cata iniciales: Se espera un cuerpo medio con final seco.',
}

export const initialBrews: Brew[] = [
  {
    id: 'b1', recipeId: 'r1', recipeName: 'IPA Clásica', batchLiters: 20, status: 'in_progress', brewDate: new Date(Date.now() - 86400000), bottlingDate: null,
    notes: 'Maceración exitosa.',
    ingredientsSnapshot: [
      { ingredientId: 'i1', quantityUsed: 4500 },
      { ingredientId: 'i2', quantityUsed: 100 },
      { ingredientId: 'i3', quantityUsed: 11.5 },
    ]
  }
]

import stylesApi from './api/styles';

const fixedInitialStyles: Style[] = [
  { id: 's1', name: 'IPA', deletedAt: null },
  { id: 's2', name: 'Stout', deletedAt: null },
  { id: 's3', name: 'Pilsner', deletedAt: null },
  { id: 's4', name: 'Amber Ale', deletedAt: null },
];
// todo: trabajar en el getInitialStyles para que use la API correctamente
export async function getInitialStyles(): Promise<Style[]> {
  try {
    return await stylesApi.getAll();
  } catch {
    return fixedInitialStyles;
  }
}

export const NEW_RECIPE_TEMPLATE: Recipe = {
  id: '',
  name: 'Nueva Receta',
  batchLiters: 20,
  style: null,
  ibu: 0,
  colorSrm: 0,
  alcoholPercent: 0,
  ingredients: [],
  details: DEFAULT_DETAILS,
  deletedAt: null,
}

export type AlertConfig = { targetBatchLiters: number; minStockPercentage: number }

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  targetBatchLiters: 20,
  minStockPercentage: 200,
}

export type SrmColor = { srm: number; color: string }

export const SRM_COLOR_MAP: SrmColor[] = [
  { srm: 0, color: '#FFD700' },
  { srm: 3, color: '#FFC800' },
  { srm: 6, color: '#FFA500' },
  { srm: 9, color: '#E59400' },
  { srm: 13, color: '#BF6C00' },
  { srm: 18, color: '#8C3D00' },
  { srm: 25, color: '#592600' },
  { srm: 35, color: '#361700' },
  { srm: 40, color: '#1A0D00' },
]

export default null as any
