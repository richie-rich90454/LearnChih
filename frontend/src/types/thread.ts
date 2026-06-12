export interface Post {
  id: number;
  threadId: number;
  userId: number;
  userName: string;
  authorName?: string;
  content: string;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
}

export interface ChannelThread {
  id: number;
  channelId: number;
  title: string;
  userId: number;
  userName: string;
  authorName?: string;
  postCount: number;
  createdAt: string;
}

export interface CreateChannelThreadRequest {
  title: string;
  content: string;
}
