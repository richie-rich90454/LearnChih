import type { AxiosResponse } from "axios";
import api from "./axios";

export interface VoiceRoom {
    id: number;
    studyGroupId: number;
    name: string;
    active: boolean;
    createdBy: number;
    creatorName: string;
    createdAt: string;
}

export interface CreateVoiceRoomRequest {
    name?: string;
}

/**
 * Study-group voice rooms API (F43).
 * Endpoints mirror VoiceRoomController on the backend.
 */
export const getVoiceRooms = (
    groupId: number,
): Promise<AxiosResponse<VoiceRoom[]>> =>
    api.get<VoiceRoom[]>(`/groups/${groupId}/voice-rooms`);

export const createVoiceRoom = (
    groupId: number,
    data: CreateVoiceRoomRequest,
): Promise<AxiosResponse<VoiceRoom>> =>
    api.post<VoiceRoom>(`/groups/${groupId}/voice-rooms`, data);

export const endVoiceRoom = (
    groupId: number,
    id: number,
): Promise<AxiosResponse<VoiceRoom>> =>
    api.put<VoiceRoom>(`/groups/${groupId}/voice-rooms/${id}/end`);
