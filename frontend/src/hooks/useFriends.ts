import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getFriends,
    getIncomingRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    unfriend,
    type Friendship,
} from "@/api/friends";

export function useFriends() {
    return useQuery<Friendship[]>({
        queryKey: ["friends"],
        queryFn: () => getFriends().then((r) => r.data),
    });
}

export function useIncomingRequests() {
    return useQuery<Friendship[]>({
        queryKey: ["friends", "requests"],
        queryFn: () => getIncomingRequests().then((r) => r.data),
    });
}

export function useSentRequests() {
    return useQuery<Friendship[]>({
        queryKey: ["friends", "sent"],
        queryFn: () => getSentRequests().then((r) => r.data),
    });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) =>
            sendFriendRequest(userId).then((r) => r.data),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (friendshipId: number) =>
            acceptFriendRequest(friendshipId).then((r) => r.data),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useDeclineFriendRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (friendshipId: number) =>
            declineFriendRequest(friendshipId).then(() => undefined),
        onSuccess: () => invalidateAll(queryClient),
    });
}

export function useUnfriend() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (friendshipId: number) =>
            unfriend(friendshipId).then(() => undefined),
        onSuccess: () => invalidateAll(queryClient),
    });
}
