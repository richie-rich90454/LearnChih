import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getResources,
  getResource,
  createResource,
  deleteResource,
  toggleUpvote,
  getLeaderboard,
} from '../api/resources'
import type { Resource, ResourceDetail, LeaderboardEntry } from '../types'

export function useResources(params?: Record<string, string>) {
  return useQuery<Resource[]>({
    queryKey: ['resources', params],
    queryFn: () => getResources(params).then((r) => r.data),
  })
}

export function useResource(id: string | undefined) {
  return useQuery<ResourceDetail>({
    queryKey: ['resource', id],
    queryFn: () => getResource(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useToggleUpvote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | undefined) => toggleUpvote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard().then((r) => r.data),
  })
}
