import type { AxiosResponse } from 'axios'
import api from './axios'
import type { Channel, ChannelThread, Post, CreateChannelThreadRequest } from '../types'

export const getChannels = (): Promise<AxiosResponse<Channel[]>> =>
  api.get<Channel[]>('/channels')

export const getChannel = (id: number | null | undefined): Promise<AxiosResponse<Channel>> =>
  api.get<Channel>(`/channels/${id}`)

export const createChannelThread = (channelId: number | null | undefined, data: CreateChannelThreadRequest): Promise<AxiosResponse<ChannelThread>> =>
  api.post<ChannelThread>(`/channels/${channelId}/threads`, data)

export const getChannelPosts = (channelId: number | null | undefined, threadId: string | undefined): Promise<AxiosResponse<Post[]>> =>
  api.get<Post[]>(`/channels/${channelId}/threads/${threadId}/posts`)

export const createChannelPost = (channelId: number | null | undefined, threadId: string | undefined, content: string): Promise<AxiosResponse<Post>> =>
  api.post<Post>(`/channels/${channelId}/threads/${threadId}/posts`, { content })
