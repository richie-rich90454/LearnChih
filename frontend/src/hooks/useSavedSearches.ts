import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSavedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    type CreateSavedSearchRequest,
    type UpdateSavedSearchRequest,
} from "../api/savedSearches";

/**
 * React Query hooks for saved searches with email alerts (F34).
 */

const SAVED_SEARCHES_KEY = ["saved-searches"] as const;

export function useSavedSearches(enabled = true) {
    return useQuery({
        queryKey: SAVED_SEARCHES_KEY,
        queryFn: () => getSavedSearches().then((r) => r.data),
        enabled,
    });
}

export function useCreateSavedSearch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSavedSearchRequest) => createSavedSearch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SAVED_SEARCHES_KEY });
        },
    });
}

export function useUpdateSavedSearch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSavedSearchRequest }) =>
            updateSavedSearch(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SAVED_SEARCHES_KEY });
        },
    });
}

export function useDeleteSavedSearch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteSavedSearch(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SAVED_SEARCHES_KEY });
        },
    });
}
