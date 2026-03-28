import { create } from 'zustand'
import { clearStoredAuthSession, setStoredAuthSession } from './api'
import type { AuthSession, HomeData } from './api'

// Do NOT auto-restore sessions — require manual login every time

interface AppState {
  isLoggedIn: boolean
  username: string | null
  authSession: AuthSession | null
  homeData: HomeData | null
  isLoading: boolean
  error: string | null

  login: (session: AuthSession) => void
  logout: () => void
  setHomeData: (data: HomeData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  username: null,
  authSession: null,
  homeData: null,
  isLoading: false,
  error: null,

  login: (session) => {
    clearStoredAuthSession()
    setStoredAuthSession(session)
    set({
      authSession: session,
      isLoggedIn: true,
      username: session.user.displayName,
      homeData: null,
      error: null,
    })
  },
  logout: () => {
    clearStoredAuthSession()
    set({
      authSession: null,
      isLoggedIn: false,
      username: null,
      homeData: null,
      error: null,
    })
  },
  setHomeData: (data) => set({ homeData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
