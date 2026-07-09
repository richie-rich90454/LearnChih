import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getGroupMessages,
    sendGroupMessage,
    type SendGroupMessageRequest,
} from "../api/groupMessages";

/**
 * React Query hooks for study-group chat (F32).
 */
export function useGroupMessages(groupId: number | null) {
    return useQuery({
        queryKey: ["group-messages", groupId],
        queryFn: () => getGroupMessages(groupId as number).then((r) => r.data),
        enabled: groupId != null,
        refetchInterval: 5000,
    });
}

export function useSendGroupMessage(groupId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SendGroupMessageRequest) => sendGroupMessage(groupId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-messages", groupId] });
        },
    });
}
