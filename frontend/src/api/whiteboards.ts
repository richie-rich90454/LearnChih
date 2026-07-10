import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Whiteboard {
    id: number;
    groupId: number;
    title: string;
    content: string | null;
    createdBy: number;
    creatorName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWhiteboardRequest {
    title: string;
}

export interface UpdateWhiteboardRequest {
    title?: string;
    content?: string;
}

/**
 * Shared whiteboard API (F42).
 * Endpoints mirror WhiteboardController on the backend.
 */
export const getWhiteboards = (
    groupId: number,
): Promise<AxiosResponse<Whiteboard[]>> =>
    api.get<Whiteboard[]>(`/groups/${groupId}/whiteboards`);

export const getWhiteboard = (
    groupId: number,
    id: number,
): Promise<AxiosResponse<Whiteboard>> =>
    api.get<Whiteboard>(`/groups/${groupId}/whiteboards/${id}`);

export const createWhiteboard = (
    groupId: number,
    data: CreateWhiteboardRequest,
): Promise<AxiosResponse<Whiteboard>> =>
    api.post<Whiteboard>(`/groups/${groupId}/whiteboards`, data);

export const updateWhiteboard = (
    groupId: number,
    id: number,
    data: UpdateWhiteboardRequest,
): Promise<AxiosResponse<Whiteboard>> =>
    api.put<Whiteboard>(`/groups/${groupId}/whiteboards/${id}`, data);

export const deleteWhiteboard = (
    groupId: number,
    id: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/groups/${groupId}/whiteboards/${id}`);
