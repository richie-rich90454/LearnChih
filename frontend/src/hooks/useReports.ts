import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getReports,
  resolveReport,
  deleteResourceAdmin,
  deletePostAdmin,
} from '../api/reports'
import type { Report } from '../types'

export function useReports(params?: Record<string, string>) {
  return useQuery<Report[]>({
    queryKey: ['reports', params],
    queryFn: () => getReports(params).then((r) => r.data),
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resolveReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDeleteResourceAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteResourceAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useDeletePostAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePostAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
