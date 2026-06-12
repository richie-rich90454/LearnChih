import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateSubjects,
  addSocial,
  removeSocial,
} from '../api/users'
import type { UserProfile, UpdateProfileRequest, UserSocialRequest } from '../types'

export function useMyProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: () => getMyProfile().then((r) => r.data),
  })
}

export function useUserProfile(id: string | undefined) {
  return useQuery<UserProfile>({
    queryKey: ['profile', id],
    queryFn: () => getUserProfile(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
  })
}

export function useUpdateSubjects() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subjects: string[]) => updateSubjects(subjects),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
  })
}

export function useAddSocial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserSocialRequest) => addSocial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
  })
}

export function useRemoveSocial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (socialId: number) => removeSocial(socialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
  })
}
