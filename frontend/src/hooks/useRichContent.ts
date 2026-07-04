import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

/**
 * Attachment metadata for a post/resource.
 * Spec refs: F1.5–F1.6.
 */
export interface Attachment {
    id: number;
    postId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
}

/**
 * Saves rich content (markdown/html) for a given post.
 * The server persists the raw source and returns the sanitized HTML.
 * Spec refs: F1.1–F1.4.
 */
export function useSaveContent(postId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (content: string): Promise<AxiosResponse<void>> =>
            api.put<void>(`/posts/${postId}/content`, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["content", postId] });
        },
    });
}

/**
 * Lists attachments belonging to a post.
 * Spec refs: F1.5–F1.6.
 */
export function useGetAttachments(postId: string | number | undefined) {
    return useQuery<Attachment[]>({
        queryKey: ["attachments", postId],
        queryFn: () => api.get<Attachment[]>(`/posts/${postId}/attachments`).then((r) => r.data),
        enabled: !!postId,
    });
}
