import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    assignModerationItem,
    dismissModerationItem,
    getModerationItems,
    resolveModerationItem,
    type ModerationQueueParams,
} from "../api/moderationQueue";

const MODERATION_KEY = ["moderation-queue"] as const;

/**
 * Paginated moderation queue list. `status` and `page` are query keys so
 * changing them refetches. Pages are 0-indexed to match Spring Data.
 */
export function useModerationQueue(params: ModerationQueueParams) {
    return useQuery({
        queryKey: [...MODERATION_KEY, params],
        queryFn: () => getModerationItems(params).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}

function useInvalidateQueue() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: MODERATION_KEY });
}

export function useAssignModerationItem() {
    const invalidate = useInvalidateQueue();
    return useMutation({
        mutationFn: (id: number) => assignModerationItem(id).then((r) => r.data),
        onSuccess: invalidate,
    });
}

export function useResolveModerationItem() {
    const invalidate = useInvalidateQueue();
    return useMutation({
        mutationFn: (id: number) => resolveModerationItem(id).then((r) => r.data),
        onSuccess: invalidate,
    });
}

export function useDismissModerationItem() {
    const invalidate = useInvalidateQueue();
    return useMutation({
        mutationFn: (id: number) => dismissModerationItem(id).then((r) => r.data),
        onSuccess: invalidate,
    });
}
