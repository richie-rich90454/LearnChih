export type PostFormat = "PLAIN" | "MARKDOWN";

export interface Post {
    id: number;
    threadId: number;
    userId: number;
    userName: string;
    authorName?: string;
    content: string;
    format?: PostFormat;
    createdAt: string;
}

export interface CreatePostRequest {
    content: string;
    format?: PostFormat;
    parentPostId?: number;
}

export interface ChannelThread {
    id: number;
    channelId: number;
    title: string;
    userId: number;
    userName: string;
    authorName?: string;
    postCount: number;
    slug?: string;
    pinned?: boolean;
    locked?: boolean;
    qaMode?: boolean;
    createdAt: string;
}

export interface CreateChannelThreadRequest {
    title: string;
    content: string;
}
