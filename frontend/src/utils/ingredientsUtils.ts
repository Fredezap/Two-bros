// Funciones utilitarias para ingredientes
import type { Ingredient } from '../types'


// Ingredientes no eliminados
export function getActiveIngredients(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.filter(i => i.deletedAt === null)
}

// Ingredientes en stock (no eliminados y isInStock true)
export function getInStockIngredients(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.filter(i => i.deletedAt === null && i.isInStock === true)
}

export function getLowStockIngredients(ingredients: Ingredient[]): Ingredient[] {
  const inStock = getInStockIngredients(ingredients)
  return inStock.filter(i => Number(i.stock) < Number(i.reorderThreshold ?? 0))
}
