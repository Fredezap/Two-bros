
import React, { useMemo } from 'react'
import { AlertTriangle, Beer, Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAppStore from '../../stores/useAppStore'
import useDataStore from '../../stores/useDataStore'
import ROUTES from '../../stores/routes'
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext'
import { useUserStore } from '../../stores/useUserStore'
import type { Ingredient } from '../../types'
import { getLowStockIngredients } from '../../utils/ingredientsUtils'
import { testTokenApi } from '../../services/api/testToken'


export const Header: React.FC = () => {
  const { currentPage, darkMode, toggleDarkMode } = useAppStore()
  const { ingredients } = useDataStore()
  const lowStockAlert = useMemo(() => getLowStockIngredients(ingredients), [ingredients])
  const hideNav = currentPage && currentPage.startsWith(ROUTES.RECIPE_FORM.split(':')[0])
  const { logout } = useAuth() || {}
  const user = useUserStore(state => state.user)
  const navigate = useNavigate()
  const handleBrewPilotClick = () => { navigate(ROUTES.HOME) };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center cursor-pointer" onClick={handleBrewPilotClick}>
          <Beer className="w-6 h-6 mr-2"/> BrewPilot
        </div>

        {/* Barra de navegación solo si hay usuario y no estamos en el form de receta */}
        {user && !hideNav && (
          <nav className="flex items-center space-x-2">
            <NavItem page={ROUTES.HOME} label="Recetas" />
            <NavItem page={ROUTES.AVAILABLE} label="Disponibles" />
            <NavItem page={ROUTES.INGREDIENTS} label="Ingredientes" />
            <NavItem page={ROUTES.BREWS} label="Cocciones" />
            <NavItem page={ROUTES.STYLES} label="Estilos" />
            <StockAlertIcon lowStockAlert={lowStockAlert} />
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {/* Botón Dark Mode siempre visible */}
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          {/* Si no hay usuario, mostrar login y registrar */}
          {!user && (
            <>
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-3 py-1 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Ingresar
              </button>
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="px-3 py-1 text-sm font-medium rounded-lg bg-yellow-700 hover:bg-yellow-800 text-white transition"
              >
                Registrarse
              </button>
            </>
          )}

          {/* Si hay usuario, solo mostrar logout */}
          {user && (
            <>
              <button
                onClick={async () => {
                  await logout();
                  toast.info('Sesión cerrada correctamente');
                  navigate(ROUTES.LOGIN);
                }}
                className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

type NavItemProps = { page: string, label: string }

const NavItem: React.FC<NavItemProps> = ({ page, label }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === page || (page.startsWith(ROUTES.RECIPE_FORM.split(':')[0]) && location.pathname.startsWith(ROUTES.RECIPE_FORM.split(':')[0]))
  return (
    <button 
      onClick={() => navigate(page)}
      className={`px-3 py-1 text-sm font-medium rounded-lg transition 
                ${isActive ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
      {label}
    </button>
  )
}

type StockAlertIconProps = { lowStockAlert?: Ingredient[] }
const StockAlertIcon: React.FC<StockAlertIconProps> = ({ lowStockAlert = [] }) => {
  const alerts = lowStockAlert
  const navigate = useNavigate()
  const location = useLocation()

  if (!alerts || alerts.length === 0) return null

  const handleAlertClick = () => {
    navigate(ROUTES.INGREDIENTS, { replace: true, state: { showOnlyLowStock: true, forceFilter: Date.now() } })
  }

  return (
    <button 
      onClick={handleAlertClick}
      className="relative p-2 rounded-full bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 transition">
      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-gray-800 bg-red-600 text-xs text-white font-bold leading-none flex items-center justify-center">
        {lowStockAlert?.length}
      </span>
    </button>
  )
}

export default Header
