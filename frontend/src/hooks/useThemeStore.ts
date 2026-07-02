import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeOrigin {
  x?: number
  y?: number
}

interface ThemeState {
  mode: ThemeMode
  origin: ThemeOrigin
  toggle: (origin?: ThemeOrigin) => void
  setMode: (mode: ThemeMode, origin?: ThemeOrigin) => void
}

const savedMode = typeof localStorage !== 'undefined'
  ? (localStorage.getItem('lernchih-theme') as ThemeMode) || null
  : null

const prefersDark = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false

const initialMode: ThemeMode = savedMode || (prefersDark ? 'dark' : 'light')

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  origin: {},
  toggle: (origin) => set((state) => {
    const next = state.mode === 'light' ? 'dark' : 'light'
    localStorage.setItem('lernchih-theme', next)
    return { mode: next, origin: origin ?? {} }
  }),
  setMode: (mode, origin) => {
    localStorage.setItem('lernchih-theme', mode)
    set({ mode, origin: origin ?? {} })
  },
}))
