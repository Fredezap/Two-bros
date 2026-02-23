import { create } from 'zustand'
import type { Ingredient, Recipe, Brew, Style } from '../types'
import { ingredientsApi } from '../services/api/ingredients'
import { recipesApi } from '../services/api/recipes'
import { brewsApi } from '../services/api/brews'
import { stylesApi } from '../services/api/styles'

type DataState = {
  ingredients: Ingredient[]
  recipes: Recipe[]
  brews: Brew[]
  styles: Style[]
  isLoading: boolean
  setIngredients: (ingredients: Ingredient[]) => void
  setRecipes: (recipes: Recipe[]) => void
  setBrews: (brews: Brew[]) => void
  setStyles: (styles: Style[]) => void
  fetchAll: () => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  ingredients: [] as Ingredient[],
  recipes: [] as Recipe[],
  brews: [] as Brew[],
  styles: [] as Style[],
  isLoading: false,

  setIngredients: (ingredients) => set({ ingredients }),
  setRecipes: (recipes) => set({ recipes }),
  setBrews: (brews) => set({ brews }),
  setStyles: (styles) => set({ styles }),

    fetchAll: async () => {
    set({ isLoading: true })
    try {
      const [stylesRes, ingRes, recRes, breRes] = await Promise.allSettled([
        stylesApi.getAll(),
        ingredientsApi.getAll(),
        recipesApi.getAll(),
        brewsApi.getAll(),
      ])
      console.log('FETCH ALL RESULTS:', { stylesRes, ingRes, recRes, breRes })
      if (stylesRes.status === 'fulfilled' && Array.isArray(stylesRes.value) && stylesRes.value.length > 0) set({ styles: stylesRes.value })
      if (ingRes.status === 'fulfilled' && Array.isArray(ingRes.value) && ingRes.value.length > 0) set({ ingredients: ingRes.value })
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) set({ recipes: recRes.value })
      if (breRes.status === 'fulfilled' && Array.isArray(breRes.value) && breRes.value.length > 0) set({ brews: breRes.value })
    } finally {
      set({ isLoading: false })
    }
  }
}))

export default useDataStore
