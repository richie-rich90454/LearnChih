import type { AxiosResponse } from "axios";
import api from "./axios";

export interface ScreenShareSession {
    id: number;
    studyGroupId: number;
    sharerUserId: number;
    sharerName: string;
    startedAt: string;
    endedAt: string | null;
    active: boolean;
}

/**
 * Study-group screen-share sessions API (F44).
 * Endpoints mirror ScreenShareController on the backend.
 */
export const getScreenShares = (
    groupId: number,
): Promise<AxiosResponse<ScreenShareSession[]>> =>
    api.get<ScreenShareSession[]>(`/groups/${groupId}/screen-shares`);

export const startScreenShare = (
    groupId: number,
): Promise<AxiosResponse<ScreenShareSession>> =>
    api.post<ScreenShareSession>(`/groups/${groupId}/screen-shares`);

export const endScreenShare = (
    groupId: number,
    id: number,
): Promise<AxiosResponse<ScreenShareSession>> =>
    api.put<ScreenShareSession>(`/groups/${groupId}/screen-shares/${id}/end`);
