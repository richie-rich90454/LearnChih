import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import api from '../api/axios'

/**
 * A bookmarked resource.
 * Spec refs: F2.15, F2.16.
 */
export interface Bookmark {
  id: number
  resourceId: number
  resourceTitle: string
  resourceSlug?: string
  createdAt: string
}

/**
 * A reading-list entry (ordered). `position` defines the order.
 * Spec ref: F2.16.
 */
export interface ReadingListItem {
  id: number
  resourceId: number
  resourceTitle: string
  position: number
  addedAt: string
}

/**
 * A recently viewed resource.
 * Spec ref: F2.21.
 */
export interface RecentlyViewedItem {
  id: number
  resourceId: number
  resourceTitle: string
  viewedAt: string
}

/* -------------------------------------------------------------------------- */
/* Bookmarks                                                                  */
/* -------------------------------------------------------------------------- */

const bookmarksKey = ['bookmarks'] as const

/** Lists the current user's bookmarks. Spec ref: F2.15. */
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: bookmarksKey,
    queryFn: () => api.get<Bookmark[]>('/bookmarks').then((r) => r.data),
  })
}

/** Adds a bookmark for a resource. Spec ref: F2.15. */
export function useAddBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number): Promise<AxiosResponse<Bookmark>> =>
      api.post<Bookmark>('/bookmarks', { resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksKey })
    },
  })
}

/** Removes a bookmark. Spec ref: F2.15. */
export function useRemoveBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number): Promise<AxiosResponse<void>> =>
      api.delete<void>(`/bookmarks/${resourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarksKey })
    },
  })
}

/**
 * Convenience toggle: adds when not bookmarked, removes otherwise.
 * Spec ref: F2.15.
 */
export function useToggleBookmark() {
  const add = useAddBookmark()
  const remove = useRemoveBookmark()
  return useMutation({
    mutationFn: async (args: { resourceId: number; bookmarked: boolean }) => {
      if (args.bookmarked) {
        return remove.mutateAsync(args.resourceId)
      }
      return add.mutateAsync(args.resourceId)
    },
  })
}

/* -------------------------------------------------------------------------- */
/* Reading list                                                               */
/* -------------------------------------------------------------------------- */

const readingListKey = ['readingList'] as const

/** Lists the current user's reading list. Spec ref: F2.16. */
export function useReadingList() {
  return useQuery<ReadingListItem[]>({
    queryKey: readingListKey,
    queryFn: () => api.get<ReadingListItem[]>('/reading-list').then((r) => r.data),
  })
}

/** Adds a resource to the reading list. Spec ref: F2.16. */
export function useAddToReadingList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number): Promise<AxiosResponse<ReadingListItem>> =>
      api.post<ReadingListItem>('/reading-list', { resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readingListKey })
    },
  })
}

/** Reorders the reading list. Spec ref: F2.16. */
export function useReorderReadingList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: number[]): Promise<AxiosResponse<void>> =>
      api.put<void>('/reading-list/reorder', { orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readingListKey })
    },
  })
}

/* -------------------------------------------------------------------------- */
/* Recently viewed                                                            */
/* -------------------------------------------------------------------------- */

const recentlyViewedKey = ['recentlyViewed'] as const

/** Lists the current user's recently viewed resources. Spec ref: F2.21. */
export function useRecentlyViewed() {
  return useQuery<RecentlyViewedItem[]>({
    queryKey: recentlyViewedKey,
    queryFn: () =>
      api.get<RecentlyViewedItem[]>('/recently-viewed').then((r) => r.data),
  })
}

/**
 * Tracks a resource view (fire-and-forget). Spec ref: F2.21.
 */
export function useTrackView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number): Promise<AxiosResponse<void>> =>
      api.post<void>('/recently-viewed', { resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recentlyViewedKey })
    },
  })
}
