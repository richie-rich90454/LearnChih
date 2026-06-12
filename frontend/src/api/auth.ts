import type { AxiosResponse } from 'axios'
import api from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest, VerifyEmailRequest } from '../types'

export const login = (email: string, password: string): Promise<AxiosResponse<AuthResponse>> =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const register = (email: string, password: string, name: string): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/register', { email, password, name })

export const verifyEmail = (email: string, code: string): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/verify', { email, code })

export const resendVerification = (email: string): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/resend', { email })
