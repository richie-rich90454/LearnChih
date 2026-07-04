import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

/**
 * A snapshot of a post's content at a point in time.
 * Spec ref: F1.13.
 */
export interface ContentVersion {
    id: number;
    postId: number;
    content: string;
    versionNumber: number;
    editedBy: string;
    createdAt: string;
}

/** Lists the saved versions of a post's content. Spec ref: F1.13. */
export function useVersions(postId: string | number | undefined) {
    return useQuery<ContentVersion[]>({
        queryKey: ["versions", postId],
        queryFn: () => api.get<ContentVersion[]>(`/posts/${postId}/versions`).then((r) => r.data),
        enabled: !!postId,
    });
}

/** Restores a previously saved content version. Spec ref: F1.13. */
export function useRestoreVersion(postId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (versionId: number): Promise<AxiosResponse<void>> =>
            api.post<void>(`/posts/${postId}/versions/${versionId}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["versions", postId] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["content", postId] });
        },
    });
}
