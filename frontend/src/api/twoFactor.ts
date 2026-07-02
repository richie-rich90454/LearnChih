import type { AxiosResponse } from 'axios'
import api from './axios'

export interface TwoFactorSetupResponse {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerifyRequest {
  code: string
}

export const setupTwoFactor = (): Promise<AxiosResponse<TwoFactorSetupResponse>> =>
  api.post<TwoFactorSetupResponse>('/auth/2fa/setup')

export const verifyTwoFactor = (data: TwoFactorVerifyRequest): Promise<AxiosResponse<void>> =>
  api.post<void>('/auth/2fa/verify', data)
