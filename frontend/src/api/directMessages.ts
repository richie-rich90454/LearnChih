import type { AxiosResponse } from "axios";
import api from "./axios";

export interface DirectMessage {
    id: number;
    fromUserId: number;
    toUserId: number;
    content: string;
    sentAt: string;
    readAt: string | null;
}

export interface ConversationSummary {
    partnerId: number;
    partnerName: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    unreadCount: number;
}

export interface PresenceInfo {
    userId: number;
    online: boolean;
    lastSeenAt: string;
}

export interface SendDirectMessageRequest {
    content: string;
}

/**
 * Direct messaging API (F31).
 */
export const getConversation = (
    userId: number,
): Promise<AxiosResponse<DirectMessage[]>> =>
    api.get<DirectMessage[]>(`/dm/${userId}`);

export const sendMessage = (
    userId: number,
    data: SendDirectMessageRequest,
): Promise<AxiosResponse<DirectMessage>> =>
    api.post<DirectMessage>(`/dm/${userId}`, data);

export const getConversations = (): Promise<AxiosResponse<ConversationSummary[]>> =>
    api.get<ConversationSummary[]>("/dm/conversations");

export const getPresence = (userId: number): Promise<AxiosResponse<PresenceInfo>> =>
    api.get<PresenceInfo>(`/presence/${userId}`);

export const heartbeat = (): Promise<AxiosResponse<PresenceInfo>> =>
    api.post<PresenceInfo>("/presence/heartbeat");

export const goOffline = (): Promise<AxiosResponse<void>> =>
    api.post<void>("/presence/offline");
