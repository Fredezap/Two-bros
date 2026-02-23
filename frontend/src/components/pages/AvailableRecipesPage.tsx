import React, { useState, useMemo } from 'react'
import { Beaker, CheckCircle, XCircle, Beer } from 'lucide-react'
import { calculateRecipeAvailability } from '../../services/logic'
import useDataStore from '../../stores/useDataStore'
import useAppStore from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import useModalStore from '../../stores/useModalStore'

const AvailableRecipesPage: React.FC = () => {
  const { ingredients, recipes } = useDataStore()
  const { alertConfig } = useAppStore()
  const reactNavigate = useNavigate()
  const [targetBatch, setTargetBatch] = useState<string>(String(Math.round(alertConfig.targetBatchLiters)))
  const { setShowModal, setRecipeId } = useModalStore();

  const { available, unavailable } = useMemo(() => {
    const batch = parseFloat(targetBatch);
    if (!targetBatch || isNaN(batch) || batch <= 0) {
      return { available: [], unavailable: [] };
    }
    const tempConfig = { targetBatchLiters: batch, minStockPercentage: 100 };
    const result = calculateRecipeAvailability(ingredients, recipes, tempConfig);
    return result;
  }, [ingredients, recipes, targetBatch])

  const getColorClass = (srm: number) => {
    if (srm > 30) return 'bg-gray-900 text-white'
    if (srm > 15) return 'bg-amber-800 text-white'
    if (srm > 5) return 'bg-amber-400 text-gray-900'
    return 'bg-yellow-200 text-gray-900'
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números enteros positivos
    let val = e.target.value.replace(/^0+/, '')
    val = val.replace(/[^0-9]/g, '')
    setTargetBatch(val)
  }

  const RecipeCard: React.FC<{ recipe: Recipe; isAvailable: boolean }> = ({ recipe, isAvailable }) => (
    <div className={`p-4 rounded-xl shadow-lg border-t-8 ${isAvailable ? 'border-green-500 bg-white dark:bg-gray-800' : 'border-red-500 bg-red-50 dark:bg-red-900/50'}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{recipe.name}</h3>
        <div className={`p-2 rounded-full font-semibold text-sm ${getColorClass(recipe.colorSrm)}`}>
          <Beer className="w-4 h-4 inline mr-1"/> {recipe.batchLiters}L
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{recipe.style?.name || 'Sin estilo'} | {recipe.ibu} IBU | {recipe.alcoholPercent}% Alc</p>

      {!isAvailable && (recipe as any).ingredientsCheck && (
        <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800 space-y-2">
          <p className="font-semibold text-red-600 dark:text-red-400 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Ingredientes Faltantes (para {targetBatch}L):</p>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 ml-2 space-y-1">
            {(recipe as any).ingredientsCheck.filter((i: any) => i.missing > 0).map((i: any) => (
              <li key={i.ingredientName}>
                {i.ingredientName}: Faltan <span className="font-bold">{i.missing.toFixed(2)}</span> ({i.requiredQty.toFixed(2)} requeridos)
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={() => {
          setRecipeId(recipe.id);
          setShowModal(true);
        }}
        className={`mt-4 w-full px-4 py-2 text-sm font-semibold rounded-lg transition shadow-md ${isAvailable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 hover:bg-red-300'}`}>
        {isAvailable ? 'Ver Detalle / Cocinar' : 'Ver Receta'}
      </button>
    </div>
  )

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Beaker className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/> ¿Qué Recetas Puedo Hacer?
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Filtro de Disponibilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Lote Objetivo (L) para Chequeo (Define las cantidades requeridas)</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              step="1"
              min="1"
              name="targetBatchLiters"
              value={targetBatch}
              onChange={handleConfigChange}
              onKeyDown={e => {
                if (e.key === '.' || e.key === ',' ) {
                  e.preventDefault();
                }
              }}
              placeholder="Ej: 20"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Botón de aplicar filtro eliminado, filtro se aplica automáticamente */}
        </div>
      </div>

      {(!targetBatch || isNaN(parseFloat(targetBatch)) || parseFloat(targetBatch) <= 0) ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-gray-500 dark:text-gray-400 italic">Por favor, ingresa un valor positivo para el lote objetivo.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center"><CheckCircle className="w-6 h-6 mr-2"/> Disponibles ({available.length})</h2>
            {available.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {available.map(r => <RecipeCard key={r.id} recipe={r} isAvailable={true} />)}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No hay recetas que cumplan con el umbral de stock.</p>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center"><XCircle className="w-6 h-6 mr-2"/> No Disponibles ({unavailable.length})</h2>
            {unavailable.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unavailable.map(r => <RecipeCard key={r.id} recipe={r} isAvailable={false} />)}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">Todas tus recetas están disponibles con tu stock actual. ¡A cocer!</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AvailableRecipesPage
