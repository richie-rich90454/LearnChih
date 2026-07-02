import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import type { AxiosResponse } from 'axios'

export interface Reaction {
  id: number
  postId: number
  userId: number
  userName: string
  emoji: string
  createdAt: string
}

export interface FollowStatus {
  following: boolean
  followersCount: number
  followingCount: number
}

export interface Endorsement {
  id: number
  userId: number
  skill: string
  endorserId: number
  endorserName: string
  createdAt: string
}

const getReactions = (postId: number): Promise<AxiosResponse<Reaction[]>> =>
  api.get<Reaction[]>(`/posts/${postId}/reactions`)

const addReaction = (postId: number, emoji: string): Promise<AxiosResponse<Reaction>> =>
  api.post<Reaction>(`/posts/${postId}/reactions`, { emoji })

const removeReaction = (postId: number, reactionId: number): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/posts/${postId}/reactions/${reactionId}`)

const getFollowStatus = (userId: number): Promise<AxiosResponse<FollowStatus>> =>
  api.get<FollowStatus>(`/users/${userId}/follow`)

const followUser = (userId: number): Promise<AxiosResponse<FollowStatus>> =>
  api.post<FollowStatus>(`/users/${userId}/follow`)

const unfollowUser = (userId: number): Promise<AxiosResponse<FollowStatus>> =>
  api.delete<FollowStatus>(`/users/${userId}/follow`)

const getFollowers = (userId: number): Promise<AxiosResponse<{ id: number; name: string; email: string }[]>> =>
  api.get(`/users/${userId}/followers`)

const getEndorsements = (userId: number): Promise<AxiosResponse<Endorsement[]>> =>
  api.get<Endorsement[]>(`/users/${userId}/endorsements`)

const endorse = (userId: number, skill: string): Promise<AxiosResponse<Endorsement>> =>
  api.post<Endorsement>(`/users/${userId}/endorsements`, { skill })

export function useReactions(postId: number) {
  return useQuery<Reaction[]>({
    queryKey: ['reactions', postId],
    queryFn: () => getReactions(postId).then((r) => r.data),
    enabled: !!postId,
  })
}

export function useAddReaction(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (emoji: string) => addReaction(postId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', postId] })
    },
  })
}

export function useRemoveReaction(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reactionId: number) => removeReaction(postId, reactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', postId] })
    },
  })
}

export function useFollow(userId: number) {
  const queryClient = useQueryClient()
  const query = useQuery<FollowStatus>({
    queryKey: ['follow', userId],
    queryFn: () => getFollowStatus(userId).then((r) => r.data),
    enabled: !!userId,
  })

  const follow = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow', userId] })
      queryClient.invalidateQueries({ queryKey: ['followers', userId] })
    },
  })

  const unfollow = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow', userId] })
      queryClient.invalidateQueries({ queryKey: ['followers', userId] })
    },
  })

  return {
    ...query,
    follow: follow.mutateAsync,
    unfollow: unfollow.mutateAsync,
    toggle: () => (query.data?.following ? unfollow.mutateAsync() : follow.mutateAsync()),
    isPending: follow.isPending || unfollow.isPending,
  }
}

export function useFollowers(userId: number) {
  return useQuery<{ id: number; name: string; email: string }[]>({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers(userId).then((r) => r.data),
    enabled: !!userId,
  })
}

export function useEndorsements(userId: number) {
  return useQuery<Endorsement[]>({
    queryKey: ['endorsements', userId],
    queryFn: () => getEndorsements(userId).then((r) => r.data),
    enabled: !!userId,
  })
}

export function useEndorse(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (skill: string) => endorse(userId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements', userId] })
    },
  })
}
