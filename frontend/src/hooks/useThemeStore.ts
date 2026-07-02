import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
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
  toggle: () => set((state) => {
    const next = state.mode === 'light' ? 'dark' : 'light'
    localStorage.setItem('lernchih-theme', next)
    return { mode: next }
  }),
  setMode: (mode) => {
    localStorage.setItem('lernchih-theme', mode)
    set({ mode })
  },
}))
