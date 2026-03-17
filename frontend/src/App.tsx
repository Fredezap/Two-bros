import UnlockAccount from './components/pages/UnlockAccount';
import React, { useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './components/common/PrivateRoute'
import Profile from './components/pages/Profile'
import ROUTES, { PUBLIC_ROUTES } from './stores/routes';
import LoginForm from './components/pages/LoginForm'
import RegisterForm from './components/pages/RegisterForm'
import ForgotPasswordForm from './components/pages/ForgotPasswordForm'
import useDataStore from './stores/useDataStore'
import Header from './components/common/Header'
import RecipeFormModal from './components/RecipeFormModal'
import { RecipeFormRoute } from './components/pages/RecipeFormRoute'
import HomePage from './components/pages/HomePage'
import InventoryPage from './components/pages/InventoryPage'
import BrewsPage from './components/pages/BrewsPage'
import AvailableRecipesPage from './components/pages/AvailableRecipesPage'
import StylesPage from './components/pages/StylesPage'
import useAppStore from './stores/useAppStore'
import { useAuth } from './contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import ResetPasswordRoute from './components/pages/ResetPasswordRoute';
import VerifyEmailRoute from './components/pages/VerifyEmailRoute';

const App: React.FC = () => {
  const { fetchAll } = useDataStore()
  const { darkMode } = useAppStore()
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Permitir rutas públicas y rutas dinámicas como /verify-email/:token
      const isPublic = PUBLIC_ROUTES.some(route => {
        if (route.includes(':')) {
          // Permitir rutas como /verify-email/:token
          const base = route.split(':')[0];
          return location.pathname.startsWith(base);
        }
        if (route === '/') {
          return location.pathname === '/';
        }
        if (route.endsWith('/')) {
          return location.pathname === route;
        }
        return location.pathname === route;
      });
      if (!isPublic) {
          navigate(ROUTES.HOME, { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

// todo: que se pueda filtrar por tipo de ingrediente ((solo maltas, lupulos, etc))
// Todo: que calculé el ibu y el color solo, como asi la gravedad final e inicial. Por lo tanto esos ya no van a ser inputs, sino que los va a ir mostrando la app automaticamente a medida que se agregan ingredientes. supongo que hay que sumar más datos a ingrediente. Asi que antes de empezar con esto, averigua bien que datos enecesita una app para hacer estos calculos. Existen formulas? se puede obtener el ingrediente desde una API que ya exista?
// Todo: comparativa de 2 recetas o más?
// todo: agregar lo de 2FA y demas
// todo: Login social (Google/Facebook)
// todo: 2FA
// todo: lo de los dispositivos e info de sesiones, con deslogueo y demas

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    if (user) { fetchAll() }
  }, [fetchAll, user])

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.RECIPE_FORM} element={<RecipeFormRoute />} />
          <Route path={ROUTES.AVAILABLE} element={<AvailableRecipesPage />} />
          <Route path={ROUTES.BREWS} element={<BrewsPage />} />
          <Route path={ROUTES.INGREDIENTS} element={<InventoryPage />} />
          <Route path={ROUTES.STYLES} element={<StylesPage />} />
          <Route path={ROUTES.PROFILE} element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path={ROUTES.LOGIN} element={<LoginForm />} />
          <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordForm />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordRoute />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailRoute />} />
          <Route path="/unlock-account/:token" element={<UnlockAccount />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>
      <RecipeFormModal />
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" aria-label={undefined} />
    </div>
  )
}

export default App
