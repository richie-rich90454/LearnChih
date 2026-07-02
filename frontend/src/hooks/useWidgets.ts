import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import type { Resource } from '../types'

/**
 * Resources related to a given resource (same subject/topic, shared tags, etc.).
 * Spec ref: F2.17.
 */
export function useRelatedResources(resourceId: string | number | undefined) {
  return useQuery<Resource[]>({
    queryKey: ['relatedResources', resourceId],
    queryFn: () =>
      api.get<Resource[]>(`/resources/${resourceId}/related`).then((r) => r.data),
    enabled: !!resourceId,
  })
}

/**
 * Trending resources across the platform.
 * Spec ref: F2.18.
 */
export function useTrending(limit = 10) {
  return useQuery<Resource[]>({
    queryKey: ['trending', limit],
    queryFn: () =>
      api
        .get<Resource[]>('/resources/trending', {
          params: { limit: String(limit) },
        })
        .then((r) => r.data),
  })
}
