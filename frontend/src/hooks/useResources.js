import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getResources,
  getResource,
  createResource,
  deleteResource,
  toggleUpvote,
  getLeaderboard,
} from '../api/resources';

export function useResources(params) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => getResources(params).then((r) => r.data),
  });
}

export function useResource(id) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => getResource(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useToggleUpvote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => toggleUpvote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard().then((r) => r.data),
  });
}
