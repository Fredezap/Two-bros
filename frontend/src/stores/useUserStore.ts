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
        set({ user });
        setTimeout(() => {
          try {
            const persisted = localStorage.getItem('user-storage');
          } catch (e) { }
        }, 100);
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
