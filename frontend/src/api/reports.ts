import type { AxiosResponse } from 'axios'
import api from './axios'
import type { Report } from '../types'

export const getReports = (params?: Record<string, string>): Promise<AxiosResponse<Report[]>> =>
  api.get<Report[]>('/reports', { params })

export const resolveReport = (id: number): Promise<AxiosResponse<Report>> =>
  api.put<Report>(`/reports/${id}/resolve`)

export const deleteResourceAdmin = (id: number): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/admin/resources/${id}`)

export const deletePostAdmin = (id: number): Promise<AxiosResponse<void>> =>
  api.delete<void>(`/admin/posts/${id}`)
