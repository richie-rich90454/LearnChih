import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getChannels,
  getChannel,
  createChannelThread,
  getChannelPosts,
  createChannelPost,
} from '../api/channels'
import type { Channel, ChannelThread, Post, CreateChannelThreadRequest } from '../types'

export function useChannels() {
  return useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: () => getChannels().then((r) => r.data),
  })
}

export function useChannel(id: number | null | undefined) {
  return useQuery<Channel>({
    queryKey: ['channel', id],
    queryFn: () => getChannel(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateChannelThread(channelId: number | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChannelThreadRequest) => createChannelThread(channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
  })
}

export function useChannelPosts(channelId: number | null | undefined, threadId: string | undefined) {
  return useQuery<Post[]>({
    queryKey: ['channelPosts', channelId, threadId],
    queryFn: () => getChannelPosts(channelId, threadId).then((r) => r.data),
    enabled: !!channelId && !!threadId,
  })
}

export function useCreateChannelPost(channelId: number | null | undefined, threadId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createChannelPost(channelId, threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelPosts', channelId, threadId] })
    },
  })
}
