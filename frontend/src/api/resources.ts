import type { AxiosResponse } from 'axios'
import api from './axios'
import type { Resource, ResourceDetail, LeaderboardEntry } from '../types'

export const getResources = (params?: Record<string, string>): Promise<AxiosResponse<Resource[]>> =>
  api.get<Resource[]>('/resources', { params })

export const getResource = (id: string | undefined): Promise<AxiosResponse<ResourceDetail>> =>
  api.get<ResourceDetail>(`/resources/${id}`)

export const createResource = (data: Record<string, unknown>): Promise<AxiosResponse<Resource>> => {
  // If we have a file, use FormData
  if (data.file) {
    const formData = new FormData();
    (Object.entries(data) as [string, unknown][]).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, val as string | Blob)
      }
    })
    return api.post<Resource>('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  return api.post<Resource>('/resources', data)
}

export const deleteResource = (id: number): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/resources/${id}`)

export const toggleUpvote = (id: string | undefined): Promise<AxiosResponse<Resource>> =>
  api.post<Resource>(`/resources/${id}/upvote`)

export const getLeaderboard = (): Promise<AxiosResponse<LeaderboardEntry[]>> =>
  api.get<LeaderboardEntry[]>('/resources/leaderboard')

export const reportResource = (id: string | undefined, reason: string): Promise<AxiosResponse<void>> =>
  api.post<void>(`/resources/${id}/report`, { reason })
