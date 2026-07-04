import type { components } from "@/generated/types.gen";
import type { Post } from "./thread";

export type ResourceCategory = components["schemas"]["ResourceCategory"];
export type ResourceType = components["schemas"]["ResourceType"];

export interface ResourceTag {
    id: number;
    name: string;
    color?: string;
}

export interface Resource {
    id: number;
    title: string;
    description: string;
    category: ResourceCategory;
    type: ResourceType;
    filePath: string | null;
    externalUrl: string | null;
    slug?: string;
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
    tags?: ResourceTag[];
}

export interface ResourceDetail extends Resource {
    threadId: number;
    posts: Post[];
    upvoted?: boolean;
}

export type CreateResourceRequest = components["schemas"]["CreateResourceRequest"] & {
    file?: File;
};
