import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Friendship {
    id: number;
    userId: number;
    name: string | null;
    status: string;
    direction: string | null;
    createdAt: string;
}

export const getFriends = (): Promise<AxiosResponse<Friendship[]>> =>
    api.get<Friendship[]>("/friends");

export const getIncomingRequests = (): Promise<AxiosResponse<Friendship[]>> =>
    api.get<Friendship[]>("/friends/requests");

export const getSentRequests = (): Promise<AxiosResponse<Friendship[]>> =>
    api.get<Friendship[]>("/friends/sent");

export const sendFriendRequest = (
    userId: number,
): Promise<AxiosResponse<Friendship>> =>
    api.post<Friendship>(`/friends/request/${userId}`);

export const acceptFriendRequest = (
    friendshipId: number,
): Promise<AxiosResponse<Friendship>> =>
    api.post<Friendship>(`/friends/${friendshipId}/accept`);

export const declineFriendRequest = (
    friendshipId: number,
): Promise<AxiosResponse<void>> =>
    api.post<void>(`/friends/${friendshipId}/decline`);

export const unfriend = (friendshipId: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/friends/${friendshipId}`);
