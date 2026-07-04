import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

/**
 * A saved draft of a post/resource.
 * Spec refs: F1.8–F1.9.
 */
export interface Draft {
    id: number;
    postId?: number;
    title: string;
    content: string;
    updatedAt: string;
}

export interface SaveDraftRequest {
    postId?: number;
    title: string;
    content: string;
}

const draftsKey = ["drafts"] as const;

/** Lists all drafts for the current user. Spec ref: F1.8. */
export function useDrafts() {
    return useQuery<Draft[]>({
        queryKey: draftsKey,
        queryFn: () => api.get<Draft[]>("/drafts").then((r) => r.data),
    });
}

/** Creates or updates a draft. Spec ref: F1.9. */
export function useSaveDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SaveDraftRequest): Promise<AxiosResponse<Draft>> =>
            api.post<Draft>("/drafts", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: draftsKey });
        },
    });
}

/** Deletes a draft by id. Spec ref: F1.9. */
export function useDeleteDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number): Promise<AxiosResponse<void>> => api.delete<void>(`/drafts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: draftsKey });
        },
    });
}

/**
 * Debounced autosave for a post's content. Saves at most once per
 * `debounceMs` (default 2s) after the user stops editing, and skips the
 * first render / empty content.
 *
 * Spec ref: F1.10.
 */
export function useAutosave(
    postId: string | number | undefined,
    content: string,
    debounceMs = 2000,
) {
    const saveDraft = useSaveDraft();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<string>("");

    useEffect(() => {
        if (!postId || !content) return;
        if (content === lastSavedRef.current) return;

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            lastSavedRef.current = content;
            saveDraft.mutate({ postId: Number(postId), title: "", content });
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, postId, debounceMs]);

    return {
        isSaving: saveDraft.isPending,
        isError: saveDraft.isError,
    };
}
