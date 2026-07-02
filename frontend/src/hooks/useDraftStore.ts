import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DraftStore {
  drafts: Record<string, string>
  setDraft: (key: string, value: string) => void
  removeDraft: (key: string) => void
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (key, value) => set((state) => ({ drafts: { ...state.drafts, [key]: value } })),
      removeDraft: (key) => set((state) => {
        const { [key]: _, ...rest } = state.drafts
        return { drafts: rest }
      }),
    }),
    { name: 'lernchih-drafts' }
  )
)

export default useDraftStore
