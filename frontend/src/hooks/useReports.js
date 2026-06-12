import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReports,
  resolveReport,
  deleteResourceAdmin,
  deletePostAdmin,
} from '../api/reports';

export function useReports(params) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => getReports(params).then((r) => r.data),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => resolveReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteResourceAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteResourceAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeletePostAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePostAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
