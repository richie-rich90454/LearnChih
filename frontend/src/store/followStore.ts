import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FollowStore {
  following: Record<number, boolean>
  isFollowing: (userId: number) => boolean
  follow: (userId: number) => void
  unfollow: (userId: number) => void
  toggle: (userId: number) => void
}

export const useFollowStore = create<FollowStore>()(
  persist(
    (set, get) => ({
      following: {},
      isFollowing: (userId: number) => !!get().following[userId],
      follow: (userId: number) =>
        set((state) => ({ following: { ...state.following, [userId]: true } })),
      unfollow: (userId: number) =>
        set((state) => {
          const { [userId]: _, ...rest } = state.following
          return { following: rest }
        }),
      toggle: (userId: number) => {
        if (get().following[userId]) {
          get().unfollow(userId)
        } else {
          get().follow(userId)
        }
      },
    }),
    { name: 'lernchih-follows' }
  )
)

export default useFollowStore
