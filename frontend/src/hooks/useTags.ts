import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

/**
 * A tag that can be assigned to posts/resources.
 * Spec ref: F1.11.
 */
export interface Tag {
    id: number;
    name: string;
    color?: string;
    usageCount?: number;
}

/** Lists all available tags. Spec ref: F1.11. */
export function useTags() {
    return useQuery<Tag[]>({
        queryKey: ["tags"],
        queryFn: () => api.get<Tag[]>("/tags").then((r) => r.data),
    });
}

/** Lists the tags currently assigned to a post. Spec ref: F1.11. */
export function usePostTags(postId: string | number | undefined) {
    return useQuery<Tag[]>({
        queryKey: ["postTags", postId],
        queryFn: () => api.get<Tag[]>(`/posts/${postId}/tags`).then((r) => r.data),
        enabled: !!postId,
    });
}

/** Assigns a tag to a post. Spec ref: F1.12. */
export function useAssignTag(postId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tagId: number): Promise<AxiosResponse<void>> =>
            api.post<void>(`/posts/${postId}/tags`, { tagId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["postTags", postId] });
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        },
    });
}

/** Removes a tag from a post. Spec ref: F1.12. */
export function useRemoveTag(postId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tagId: number): Promise<AxiosResponse<void>> =>
            api.delete<void>(`/posts/${postId}/tags/${tagId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["postTags", postId] });
        },
    });
}
