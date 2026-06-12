import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChannels,
  getChannel,
  createChannelThread,
  getChannelPosts,
  createChannelPost,
} from '../api/channels';

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels().then((r) => r.data),
  });
}

export function useChannel(id) {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => getChannel(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateChannelThread(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createChannelThread(channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useChannelPosts(channelId, threadId) {
  return useQuery({
    queryKey: ['channelPosts', channelId, threadId],
    queryFn: () => getChannelPosts(channelId, threadId).then((r) => r.data),
    enabled: !!channelId && !!threadId,
  });
}

export function useCreateChannelPost(channelId, threadId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => createChannelPost(channelId, threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelPosts', channelId, threadId] });
    },
  });
}
