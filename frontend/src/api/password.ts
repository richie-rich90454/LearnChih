import type { AxiosResponse } from 'axios'
import api from './axios'

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangeEmailRequest {
  newEmail: string
  password: string
}

export const forgotPassword = (data: ForgotPasswordRequest): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/forgot-password', data)

export const resetPassword = (data: ResetPasswordRequest): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/reset-password', data)

export const changeEmail = (data: ChangeEmailRequest): Promise<AxiosResponse<void>> =>
  api.post<void>('/users/me/email', data)
