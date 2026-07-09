import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSubscription,
    updateSubscription,
    type UpdateSubscriptionRequest,
    type DigestFrequency,
} from "../api/threadSubscriptions";

/**
 * React Query hooks for per-thread subscription (F33).
 */
export function useThreadSubscription(threadId: number | null) {
    return useQuery({
        queryKey: ["thread-subscription", threadId],
        queryFn: () => getSubscription(threadId as number).then((r) => r.data),
        enabled: threadId != null,
    });
}

export function useUpdateThreadSubscription(threadId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (frequency: DigestFrequency) =>
            updateSubscription(threadId, { frequency }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thread-subscription", threadId] });
        },
    });
}
