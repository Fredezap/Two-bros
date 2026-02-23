import React, { useState, useMemo } from 'react'
import useDataStore from '../../stores/useDataStore'
import useModalStore from '../../stores/useModalStore'
import { ROUTES } from '../../stores/routes'
import { Beer, Plus, CheckCircle, Utensils, Search, ChevronRight } from 'lucide-react'
import { BeerGlassIcon } from '../common/Icons'
import { useNavigate } from 'react-router-dom'
import type { Recipe } from '../../types'
import RecipeFormModal from '../RecipeFormModal'
import { useAuth } from '../../contexts/AuthContext'

export const HomePage: React.FC = () => {
  const { user } = useAuth() || {};
    const [searchTerm, setSearchTerm] = useState('')
  const { recipes } = useDataStore()
  const { setShowModal, setRecipeId } = useModalStore()
  const reactNavigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [showRecipeModal, setShowRecipeModal] = useState(false)

  const activeRecipes = useMemo(() => recipes.filter((r: Recipe) => r.deletedAt === null), [recipes])

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) {
      return activeRecipes
    }
    return activeRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeRecipes, searchTerm])

  const handleRecipeClick = (recipeId: string) => {
    setRecipeId(recipeId)
    setShowModal(true)
    setEditMode(null) // Para que isEditing se setee en null en RecipeFormModal
    setShowRecipeModal(true)
  }

  const handleAddRecipe = () => {
    setRecipeId(null)
    setShowModal(true)
    setEditMode(true)
    setShowRecipeModal(true)
  }

  const handleCloseModal = () => {
    setShowRecipeModal(false)
    setShowModal(false)
  }
  console.log("USER EN HOMEPAGE:", user);
  if (!user) {
    return (
      <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Beer className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/>
          ¡Bienvenido a BrewPilot!
        </h1>
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 text-center max-w-xl">
          Para comenzar a gestionar tus recetas, ingredientes y cocciones, por favor
          <button
            onClick={() => reactNavigate(ROUTES.LOGIN)}
            className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition px-0 py-0 bg-transparent border-none shadow-none focus:outline-none"
            style={{ background: 'none', boxShadow: 'none', textDecoration: 'none' }}
          >
            Iniciá sesión
          </button>
          <span className="mx-1"> o </span>
          <button
            onClick={() => reactNavigate(ROUTES.REGISTER)}
            className="text-yellow-700 font-semibold hover:text-yellow-800 transition px-0 py-0 bg-transparent border-none shadow-none focus:outline-none"
            style={{ background: 'none', boxShadow: 'none', textDecoration: 'none' }}
          >
            creá una cuenta
          </button>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Beer className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400"/>
          Mis recetas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={handleAddRecipe}
          className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md">
          <Plus className="w-5 h-5 mr-2" /> Agregar receta
        </button>
        <button 
          onClick={() => reactNavigate(ROUTES.AVAILABLE)}
          className="flex items-center justify-center px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition shadow-md">
          <CheckCircle className="w-5 h-5 mr-2" /> ¿Qué recetas puedo hacer?
        </button>
        <button 
          onClick={() => reactNavigate(ROUTES.BREWS)}
          className="flex items-center justify-center px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition shadow-md">
          <Utensils className="w-5 h-5 mr-2" /> Cocciones anteriores
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar recetas por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="space-y-4">
        {activeRecipes.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400 italic">Aún no has creado recetas. ¡Comienza agregando una!</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400 italic">No se encontraron recetas con ese nombre.</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition">
                Ver todas las recetas
              </button>
            )}
          </div>
        ) : (
          filteredRecipes.map((r: Recipe) => (
            <div key={r.id}
              onClick={() => handleRecipeClick(r.id)}
              className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer border-l-4 border-indigo-500">
              <div className="flex items-center space-x-4">
                <BeerGlassIcon srm={r.colorSrm} />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{r.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.style?.name || 'Sin estilo'} | {r.alcoholPercent}% Alc | {r.ibu} IBU</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400">
                <span className="text-sm font-semibold">Ver</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>
      {showRecipeModal && (
        <RecipeFormModal initialEditMode={editMode} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default HomePage
