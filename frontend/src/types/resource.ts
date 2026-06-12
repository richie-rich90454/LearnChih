export type ResourceCategory = 'ARTICLE' | 'VIDEO' | 'PDF' | 'GUIDE' | 'LECTURE_RECORDING' | 'OTHER';
export type ResourceType = 'UPLOAD' | 'LINK';

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  filePath: string | null;
  externalUrl: string | null;
  userId: number;
  userName: string;
  subjectId: number | null;
  subjectName: string | null;
  upvoteCount: number;
  upvotedByMe: boolean;
  createdAt: string;
  authorName?: string;
  subject?: string;
  url?: string;
}

export interface ResourceDetail extends Resource {
  threadId: number;
  posts: Post[];
  upvoted?: boolean;
}

// Import Post from thread types — we'll use a forward reference
import type { Post } from './thread';

export interface CreateResourceRequest {
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  subjectId?: number;
  topicId?: number;
  courseId?: number;
  externalUrl?: string;
  file?: File;
}
