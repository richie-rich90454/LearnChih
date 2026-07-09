import type { AxiosResponse } from "axios";
import api from "./axios";

export interface GroupMessage {
    id: number;
    studyGroupId: number;
    userId: number;
    userName: string;
    content: string;
    sentAt: string;
}

export interface SendGroupMessageRequest {
    content: string;
}

/**
 * Study-group chat API (F32).
 */
export const getGroupMessages = (
    groupId: number,
): Promise<AxiosResponse<GroupMessage[]>> =>
    api.get<GroupMessage[]>(`/study-groups/${groupId}/messages`);

export const sendGroupMessage = (
    groupId: number,
    data: SendGroupMessageRequest,
): Promise<AxiosResponse<GroupMessage>> =>
    api.post<GroupMessage>(`/study-groups/${groupId}/messages`, data);
