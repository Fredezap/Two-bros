import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/user'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        console.log('[useUserStore] setUser llamado con:', user);
        set({ user });
        setTimeout(() => {
          try {
            const persisted = localStorage.getItem('user-storage');
            console.log('[useUserStore] user-storage en localStorage tras setUser:', persisted);
          } catch (e) {
            console.warn('[useUserStore] Error leyendo localStorage:', e);
          }
        }, 100);
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
