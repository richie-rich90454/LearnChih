import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResourcePosts, createResourcePost } from '../api/threads'
import type { Post } from '../types'

export function useResourcePosts(resourceId: string | undefined) {
  return useQuery<Post[]>({
    queryKey: ['resourcePosts', resourceId],
    queryFn: () => getResourcePosts(resourceId).then((r) => r.data),
    enabled: !!resourceId,
  })
}

export function useCreateResourcePost(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createResourcePost(resourceId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resourcePosts', resourceId] })
    },
  })
}
