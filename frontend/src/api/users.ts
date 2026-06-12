import type { AxiosResponse } from 'axios'
import api from './axios'
import type { UserProfile, UpdateProfileRequest, UserSocialRequest } from '../types'

export const getMyProfile = (): Promise<AxiosResponse<UserProfile>> =>
  api.get<UserProfile>('/users/me')

export const getUserProfile = (id: string | undefined): Promise<AxiosResponse<UserProfile>> =>
  api.get<UserProfile>(`/users/${id}`)

export const updateProfile = (data: UpdateProfileRequest): Promise<AxiosResponse<UserProfile>> =>
  api.put<UserProfile>('/users/me', data)

export const updateSubjects = (subjects: string[]): Promise<AxiosResponse<void>> =>
  api.put<void>('/users/me/subjects', { subjects })

export const addSocial = (data: UserSocialRequest): Promise<AxiosResponse<void>> =>
  api.post<void>('/users/me/socials', data)

export const removeSocial = (socialId: number): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/users/me/socials/${socialId}`)
