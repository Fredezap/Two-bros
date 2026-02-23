import type { Ingredient, Recipe, Brew, Style } from '../types'

export const calculateIbu = (recipe: Recipe): number => {
  const hopCount = recipe.ingredients.filter(ri => ri.usageMoment.includes('Boil')).length
  const baseIbu = 10
  const newIbu = baseIbu + hopCount * 10
  return Math.max(0, newIbu)
}

export const calculateRecipeAvailability = (ingredients: Ingredient[], recipes: Recipe[], config) => {
  const currentIngredientsMap = new Map(
    ingredients
      .filter(i => i.deletedAt === null)
      .map(i => [i.id, i])
  )

  const available: Recipe[] = []
  const unavailable: Recipe[] = []
  const targetBatchLiters = config.targetBatchLiters || 20
  const minFactor = (config.minStockPercentage || 100) / 100

  for (const recipe of recipes.filter(r => r.deletedAt === null)) {
    // Log de entrada de la receta y sus ingredientes
    let isSufficient = true
    const checks = []

    const requiredTotals = new Map<string, number>()
    recipe.ingredients.forEach(ri => {
      // Convertir quantity a número siempre
      const qty = Number(ri.quantity)
      if (!isFinite(qty) || qty <= 0) {
        console.warn(`[AVAIL] Cantidad inválida para ingrediente ${ri.ingredientName}:`, ri.quantity)
        return
      }
      const prev = requiredTotals.get(ri.ingredientId) || 0
      requiredTotals.set(ri.ingredientId, prev + qty)
    })

    const scaleFactor = targetBatchLiters / recipe.batchLiters

    for (const [ingredientId, totalQuantity] of requiredTotals.entries()) {
      const stock = currentIngredientsMap.get(ingredientId)
      const requiredQty = totalQuantity * scaleFactor
      const currentStock = stock?.stock || 0

      const meetsAvailability = currentStock >= requiredQty
      const minStockRequired = requiredQty * minFactor

      if (!meetsAvailability) {
        isSufficient = false
      }

      checks.push({
        ingredientName: stock?.name || 'Desconocido',
        requiredQty,
        minStockRequired,
        currentStock,
        missing: requiredQty - currentStock,
        isSufficient: meetsAvailability,
      })
    }

    const recipeWithCheck = { ...recipe, ingredientsCheck: checks }

    if (isSufficient) {
      available.push(recipeWithCheck)
    } else {
      unavailable.push(recipeWithCheck)
    }
  }

  return { available, unavailable }
}

// Ported domain services (selected)
export const recipeService = {
  save: (currentRecipes: Recipe[], recipeToSave: Recipe) => {
    const updatedRecipe = { ...recipeToSave, ibu: calculateIbu(recipeToSave) }

    if (currentRecipes.find(r => r.id === updatedRecipe.id)) {
      return currentRecipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r)
    } else {
      const newRecipe = { ...updatedRecipe, id: crypto.randomUUID() }
      return [...currentRecipes, newRecipe]
    }
  },
  softDelete: (currentRecipes: Recipe[], currentBrews: Brew[], recipeId: string) => {
    const hasBrewRef = currentBrews.some(b => b.recipeId === recipeId)

    if (hasBrewRef) {
      throw new Error('409 Conflict: No se puede eliminar. Existen cocciones asociadas a esta receta.')
    }

    return currentRecipes.map(r => r.id === recipeId ? { ...r, deletedAt: new Date() as any } : r)
  },
  scale: (currentRecipe: Recipe, newBatchLiters: number) => {
    const scaleFactor = newBatchLiters / currentRecipe.batchLiters

    const scaledIngredients = currentRecipe.ingredients.map(ri => ({
      ...ri,
      quantity: ri.quantity * scaleFactor,
    }))

    return {
      ...currentRecipe,
      batchLiters: newBatchLiters,
      ingredients: scaledIngredients,
    }
  },
  clone: (currentRecipes: Recipe[], recipeToClone: Recipe, ingredients: Ingredient[]) => {
    const clonedRecipe = {
      ...recipeToClone,
      id: crypto.randomUUID(),
      name: `Clonación ${recipeToClone.name}`,
      deletedAt: null,
      details: { ...recipeToClone.details },
      ingredients: recipeToClone.ingredients.map(ri => ({ ...ri })),
    }

    const { newIngredients } = recipeService.syncIngredientsToInventory(clonedRecipe, ingredients)

    return {
      newRecipes: [clonedRecipe, ...currentRecipes],
      newIngredients: newIngredients
    }
  },
  syncIngredientsToInventory: (recipe: Recipe, currentIngredients: Ingredient[]) => {
    const currentNames = new Set(currentIngredients.filter(i => i.deletedAt === null).map(i => i.name.toLowerCase()))
    let newIngredients = [...currentIngredients]
    let addedCount = 0

    recipe.ingredients.forEach(ri => {
      const ingredientNameLower = ri.ingredientName?.toLowerCase() || ''

      if (!currentNames.has(ingredientNameLower)) {
        const getTypeFromName = (name = '') => {
          const n = name.toLowerCase()
          if (n.includes('malta')) return 'malt'
          if (n.includes('lúpulo') || n.includes('lupulo')) return 'hop'
          if (n.includes('levadura') || n.includes('yeast')) return 'yeast'
          return 'other'
        }

        const type = getTypeFromName(ri.ingredientName) as import('../types').IngredientType
        const unit = ((type === 'malt' || type === 'hop' || type === 'yeast') ? 'g' : 'l') as import('../types').UnitOfMeasure

        const newIngredient = {
          id: crypto.randomUUID(),
          name: ri.ingredientName || 'Desconocido',
          type: type,
          unitOfMeasure: unit,
          stock: 0,
          reorderThreshold: 0,
          deletedAt: null,
          isInStock: true,
        }
        newIngredients.push(newIngredient)
        addedCount++
      }
    })
    return { newIngredients, addedCount }
  }
}

export const brewService = {
  cancelBrew: (currentBrews: Brew[], currentIngredients: Ingredient[], brewId: string) => {
    const brew = currentBrews.find(b => b.id === brewId)
    if (!brew || brew.status !== 'in_progress') throw new Error('Error de estado')

    const updatedIngredientsMap = new Map(currentIngredients.map(i => [i.id, { ...i }]))
    brew.ingredientsSnapshot.forEach(snapshot => {
      const ingredient = updatedIngredientsMap.get(snapshot.ingredientId)
      if (ingredient) { ingredient.stock = ingredient.stock + snapshot.quantityUsed }
    })

    const updatedBrew = { ...brew, status: 'cancelled' }
    const newBrews = currentBrews.map(b => b.id === brewId ? updatedBrew : b)
    const newIngredients = Array.from(updatedIngredientsMap.values())

    return { newBrews, newIngredients }
  },
  createBrew: (currentBrews: Brew[], currentRecipes: Recipe[], currentIngredients: Ingredient[], recipeId: string, force: boolean) => {
    const recipe = currentRecipes.find(r => r.id === recipeId)
    if (!recipe) throw new Error('Receta no encontrada')

    const updatedIngredientsMap = new Map(currentIngredients.map(i => [i.id, { ...i }]))
    const ingredientsSnapshot = []
    const requiredTotals = new Map<string, number>()
    recipe.ingredients.forEach(ri => {
      requiredTotals.set(ri.ingredientId, (requiredTotals.get(ri.ingredientId) || 0) + ri.quantity)
    })

    const missingIngredients = []
    for (const [ingredientId, totalQuantity] of requiredTotals.entries()) {
      const ingredient = updatedIngredientsMap.get(ingredientId)
      if (ingredient && ingredient.stock < totalQuantity) {
        missingIngredients.push({ name: ingredient.name, missing: totalQuantity - ingredient.stock })
      }
    }

    if (missingIngredients.length > 0 && !force) {
      throw new Error(`409 Conflict: Stock insuficiente. Faltantes: ${missingIngredients.map(m => `${m.name} (${m.missing.toFixed(2)})`).join(', ')}`)
    }

    for (const [ingredientId, totalQuantity] of requiredTotals.entries()) {
      const ingredient = updatedIngredientsMap.get(ingredientId)
      if (ingredient) {
        ingredient.stock -= totalQuantity
        updatedIngredientsMap.set(ingredient.id, ingredient)
        ingredientsSnapshot.push({ ingredientId: ingredient.id, quantityUsed: totalQuantity })
      }
    }

    const newBrew = { id: crypto.randomUUID(), recipeId, recipeName: recipe.name, batchLiters: recipe.batchLiters, status: 'in_progress', brewDate: new Date(), bottlingDate: null, notes: `Iniciada desde receta ${recipe.name}.`, ingredientsSnapshot }

    return { newBrews: [newBrew, ...currentBrews], newIngredients: Array.from(updatedIngredientsMap.values()), brew: newBrew }
  },
  finishBrew: (currentBrews: Brew[], brewId: string, bottlingDate = null) => {
    return currentBrews.map(b => 
      b.id === brewId && b.status === 'in_progress'
        ? { ...b, status: 'finished', bottlingDate: bottlingDate } 
        : b
    )
  },
  deleteBrew: (currentBrews: Brew[], brewId: string) => {
    return currentBrews.filter(b => b.id !== brewId)
  }
}

// Implementaciones adicionales portadas desde la versión JS para completar la API
export const ingredientService = {
  save: (currentIngredients: any[], newIngredient: any) => {
    if (newIngredient.id) {
      return currentIngredients.map(i => i.id === newIngredient.id ? { ...i, ...newIngredient } : i)
    } else {
      const created = { ...newIngredient, id: crypto.randomUUID(), deletedAt: null }
      return [...currentIngredients, created]
    }
  },
  softDelete: (currentIngredients: any[], currentRecipes: any[], id: string) => {
    const hasRecipeRef = currentRecipes.some(r => r.deletedAt === null && r.ingredients.some((ri: any) => ri.ingredientId === id))
    if (hasRecipeRef) {
      throw new Error('409 Conflict: No se puede eliminar. El ingrediente está siendo usado en al menos una receta activa.')
    }
    return currentIngredients.map(i => i.id === id ? { ...i, deletedAt: new Date() as any } : i)
  },
  restock: (currentIngredients: any[], id: string, amount: number) => {
    return currentIngredients.map(i => i.id === id ? { ...i, stock: i.stock + amount } : i)
  },
  addFromApi: (currentIngredients: any[], name: string) => {
    const type = name.toLowerCase().includes('lúpulo') ? 'hop' : (name.toLowerCase().includes('malta') ? 'malt' : 'other')
    const unit = (['malt', 'hop', 'yeast'] as string[]).includes(type as string) ? 'g' : 'l'

    const newApiIngredient = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      unitOfMeasure: unit,
      stock: 0,
      reorderThreshold: 50,
      deletedAt: null,
    }
    if (currentIngredients.some(i => i.name.toLowerCase() === name.toLowerCase() && i.deletedAt === null)) {
      throw new Error(`409 Conflict: El ingrediente ${name} ya existe en el inventario.`)
    }
    return [...currentIngredients, newApiIngredient]
  }
}

export const styleService = {
  save: (currentStyles: any[], newStyle: any) => {
    if (newStyle.id) {
      return currentStyles.map(s => s.id === newStyle.id ? { ...s, ...newStyle } : s)
    } else {
      const created = { ...newStyle, id: crypto.randomUUID(), deletedAt: null }
      return [...currentStyles, created]
    }
  },
  softDelete: (currentStyles: any[], currentRecipes: any[], styleId: string) => {
    const styleName = currentStyles.find(s => s.id === styleId)?.name
    const hasRecipeRef = currentRecipes.some(r => r.deletedAt === null && r.style === styleName)
    if (hasRecipeRef) {
      throw new Error('409 Conflict: El estilo está siendo usado en al menos una receta activa.')
    }
    return currentStyles.map(s => s.id === styleId ? { ...s, deletedAt: new Date() as any } : s)
  }
}
