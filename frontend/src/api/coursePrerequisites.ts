import type { AxiosResponse } from "axios";
import api from "./axios";

export interface PrerequisiteEdge {
    id: number;
    courseId: number;
    prerequisiteCourseId: number;
    prerequisiteCourseName: string;
    createdAt: string;
}

export interface PrerequisiteGap {
    prerequisiteCourseId: number;
    prerequisiteCourseName: string;
    completed: boolean;
}

export interface PrerequisiteStatus {
    courseId: number;
    satisfied: boolean;
    gaps: PrerequisiteGap[];
}

export interface CreatePrerequisiteRequest {
    prerequisiteCourseId: number;
}

/**
 * Course prerequisite graph API (F19).
 * Endpoints mirror CoursePrerequisiteController on the backend.
 */
export const getPrerequisites = (
    courseId: number,
): Promise<AxiosResponse<PrerequisiteEdge[]>> =>
    api.get<PrerequisiteEdge[]>(`/courses/${courseId}/prerequisites`);

export const addPrerequisite = (
    courseId: number,
    data: CreatePrerequisiteRequest,
): Promise<AxiosResponse<PrerequisiteEdge>> =>
    api.post<PrerequisiteEdge>(`/courses/${courseId}/prerequisites`, data);

export const removePrerequisite = (
    courseId: number,
    prerequisiteCourseId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/courses/${courseId}/prerequisites/${prerequisiteCourseId}`);

export const getPrerequisiteStatus = (
    courseId: number,
    userId: number,
): Promise<AxiosResponse<PrerequisiteStatus>> =>
    api.get<PrerequisiteStatus>(`/courses/${courseId}/prerequisites/status`, {
        params: { userId },
    });
