import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BookmarkItem {
  resourceId: number
  title: string
  url?: string
  addedAt: string
}

interface BookmarkStore {
  bookmarks: Record<number, BookmarkItem>
  isBookmarked: (resourceId: number) => boolean
  toggleBookmark: (resourceId: number, title: string, url?: string) => void
  addBookmark: (resourceId: number, title: string, url?: string) => void
  removeBookmark: (resourceId: number) => void
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: {},
      isBookmarked: (resourceId: number) => !!get().bookmarks[resourceId],
      toggleBookmark: (resourceId: number, title: string, url?: string) => {
        if (get().bookmarks[resourceId]) {
          get().removeBookmark(resourceId)
        } else {
          get().addBookmark(resourceId, title, url)
        }
      },
      addBookmark: (resourceId: number, title: string, url?: string) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            [resourceId]: {
              resourceId,
              title,
              url,
              addedAt: new Date().toISOString(),
            },
          },
        })),
      removeBookmark: (resourceId: number) =>
        set((state) => {
          const { [resourceId]: _, ...rest } = state.bookmarks
          return { bookmarks: rest }
        }),
    }),
    { name: 'lernchih-bookmarks' }
  )
)

export default useBookmarkStore
