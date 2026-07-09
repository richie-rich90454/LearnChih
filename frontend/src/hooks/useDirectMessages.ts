import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getConversation,
    sendMessage,
    getConversations,
    getPresence,
    heartbeat,
    type SendDirectMessageRequest,
} from "../api/directMessages";

/**
 * React Query hooks for 1:1 direct messaging and presence (F31).
 */

export function useConversations() {
    return useQuery({
        queryKey: ["dm", "conversations"],
        queryFn: () => getConversations().then((r) => r.data),
        refetchInterval: 5000,
    });
}

export function useConversation(partnerId: number | null) {
    return useQuery({
        queryKey: ["dm", "conversation", partnerId],
        queryFn: () => getConversation(partnerId as number).then((r) => r.data),
        enabled: partnerId != null,
        refetchInterval: 5000,
    });
}

export function useSendDirectMessage(partnerId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SendDirectMessageRequest) => sendMessage(partnerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dm", "conversation", partnerId] });
            queryClient.invalidateQueries({ queryKey: ["dm", "conversations"] });
        },
    });
}

export function usePresence(userId: number | null) {
    return useQuery({
        queryKey: ["presence", userId],
        queryFn: () => getPresence(userId as number).then((r) => r.data),
        enabled: userId != null,
        refetchInterval: 5000,
    });
}

/**
 * Periodically sends a heartbeat so the current user appears online while the
 * messages page is open. Returns a query used only for its polling lifecycle.
 */
export function useHeartbeat(enabled: boolean) {
    return useQuery({
        queryKey: ["presence", "heartbeat"],
        queryFn: () => heartbeat().then((r) => r.data),
        enabled,
        refetchInterval: 30_000,
    });
}
