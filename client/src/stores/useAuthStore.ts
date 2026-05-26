import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  userType?: 'admin' | 'user' | string
  jobTitle?: string
  authType?: 'email' | 'google' | string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        _hasHydrated: false,
        isLoading: true, // Start loading as true so the bootstrap catches it
        setAuth: (user, token) => {
          console.log('Zustand setAuth called with:', { user, token })
          set({ user, token, isAuthenticated: true }, false, 'auth/setAuth')
        },
        logout: () =>
          set(
            { user: null, token: null, isAuthenticated: false },
            false,
            'auth/logout',
          ),
        setHasHydrated: (state) =>
          set({ _hasHydrated: state }, false, 'auth/setHasHydrated'),
        fetchUser: async () => {
          console.log('Zustand fetchUser called')
          set({ isLoading: false }, false, 'auth/fetchUser')
        },
      }),
      {
        name: 'cardlyi-auth',
        onRehydrateStorage: () => (state) => {
          console.log('Zustand onRehydrateStorage called, state:', state)
          state?.setHasHydrated(true)
          state?.fetchUser()
        },
      },
    ),
    { name: 'AuthStore' },
  ),
)
