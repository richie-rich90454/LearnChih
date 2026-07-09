import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSuggestions,
    dismissSuggestion,
    markConnected,
    type BuddySuggestion,
} from "@/api/matching";

export function useBuddySuggestions() {
    return useQuery<BuddySuggestion[]>({
        queryKey: ["matching", "suggestions"],
        queryFn: () => getSuggestions().then((r) => r.data),
    });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ["matching"] });
}

export function useDismissSuggestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (matchId: number) =>
            dismissSuggestion(matchId).then(() => undefined),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useMarkConnected() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (buddyId: number) =>
            markConnected(buddyId).then(() => undefined),
        onSuccess: () => invalidateAll(queryClient),
    });
}
