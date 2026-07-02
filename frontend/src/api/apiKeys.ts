import type { AxiosResponse } from 'axios'
import api from './axios'

export interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  createdAt: string
  lastUsedAt?: string
}

export const getApiKeys = (): Promise<AxiosResponse<ApiKey[]>> =>
  api.get<ApiKey[]>('/api-keys')

export const createApiKey = (name: string): Promise<AxiosResponse<ApiKey>> =>
  api.post<ApiKey>('/api-keys', { name })

export const revokeApiKey = (id: string): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/api-keys/${id}`)
