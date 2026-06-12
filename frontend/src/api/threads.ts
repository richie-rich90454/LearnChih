import type { AxiosResponse } from 'axios'
import api from './axios'
import type { Post } from '../types'

export const getResourcePosts = (resourceId: string | undefined): Promise<AxiosResponse<Post[]>> =>
  api.get<Post[]>(`/resources/${resourceId}/posts`)

export const createResourcePost = (resourceId: string | undefined, content: string): Promise<AxiosResponse<Post>> =>
  api.post<Post>(`/resources/${resourceId}/posts`, { content })
