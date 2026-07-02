import type { AxiosResponse } from 'axios'
import api from './axios'

export const exportUserData = (): Promise<AxiosResponse<Blob>> =>
  api.get<Blob>('/user/export', { responseType: 'blob' })

export const deleteUserAccount = (): Promise<AxiosResponse<void>> =>
  api.delete<void>('/user/delete')
