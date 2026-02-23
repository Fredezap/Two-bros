import { create } from 'zustand'
import { DEFAULT_ALERT_CONFIG } from '../services/initialData'
import { ROUTES } from './routes'

type AlertConfig = typeof DEFAULT_ALERT_CONFIG

type AppState = {
  currentPage: string
  editingRecipeId: string | null
  darkMode: boolean
  alertConfig: AlertConfig
  lastSyncedPath: string | null

  navigate: (page: string, id?: string | null) => void
  setEditingRecipeId: (id: string | null) => void
  setCurrentPage: (page: string) => void
  setLastSyncedPath: (p: string | null) => void
  toggleDarkMode: () => void
  setAlertConfig: (cfg: AlertConfig) => void
}


export const useAppStore = create<AppState>((set) => {
  // Leer darkMode de localStorage si existe
  let initialDarkMode = false;
  try {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) initialDarkMode = stored === 'true';
  } catch {}

  return {
    currentPage: ROUTES.HOME,
    editingRecipeId: null,
    darkMode: initialDarkMode,
    alertConfig: DEFAULT_ALERT_CONFIG,
    lastSyncedPath: null,

    navigate: (page, id = null) => set({ currentPage: page, editingRecipeId: page === ROUTES.RECIPE_FORM ? id : null }),
    setEditingRecipeId: (id) => set({ editingRecipeId: id }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setLastSyncedPath: (p) => set({ lastSyncedPath: p }),
    toggleDarkMode: () => set((s) => {
      const newValue = !s.darkMode;
      try { localStorage.setItem('darkMode', String(newValue)); } catch {}
      return { darkMode: newValue };
    }),
    setAlertConfig: (cfg) => set({ alertConfig: cfg }),
  }
})

export default useAppStore
