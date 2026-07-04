import type { AxiosResponse } from "axios";
import api from "./axios";

export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    subject?: string;
    isPublic: boolean;
    memberCount: number;
    createdAt: string;
}

export interface CreateStudyGroupRequest {
    name: string;
    description: string;
    subject?: string;
    isPublic?: boolean;
}

/**
 * Study groups API stubs. Full backend implementation is out of scope for
 * this frontend-only task.
 *
 * Spec refs: F6.51–F6.56.
 */
export const getStudyGroups = (): Promise<AxiosResponse<StudyGroup[]>> =>
    api.get<StudyGroup[]>("/study-groups");

export const createStudyGroup = (
    data: CreateStudyGroupRequest,
): Promise<AxiosResponse<StudyGroup>> => api.post<StudyGroup>("/study-groups", data);

export const joinStudyGroup = (id: number): Promise<AxiosResponse<void>> =>
    api.post<void>(`/study-groups/${id}/join`);

export const leaveStudyGroup = (id: number): Promise<AxiosResponse<void>> =>
    api.post<void>(`/study-groups/${id}/leave`);
