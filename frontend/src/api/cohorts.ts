import type { AxiosResponse } from "axios";
import api from "./axios";

export interface Cohort {
    id: number;
    name: string;
    description: string | null;
    subjectId: number | null;
    startDate: string | null;
    endDate: string | null;
    maxMembers: number | null;
    memberCount: number;
    /** LEADER, MEMBER, or null when the viewer is not a member. */
    role: string | null;
    createdAt: string;
}

export interface CohortMember {
    id: number;
    userId: number;
    userName: string;
    role: string;
    joinedAt: string;
}

export interface CreateCohortRequest {
    name: string;
    description?: string;
    subjectId?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    maxMembers?: number | null;
}

/**
 * Cohort-based study groups API (F40).
 * Endpoints mirror CohortController on the backend.
 */
export const getCohorts = (): Promise<AxiosResponse<Cohort[]>> =>
    api.get<Cohort[]>("/cohorts");

export const getCohort = (id: number): Promise<AxiosResponse<Cohort>> =>
    api.get<Cohort>(`/cohorts/${id}`);

export const createCohort = (
    data: CreateCohortRequest,
): Promise<AxiosResponse<Cohort>> => api.post<Cohort>("/cohorts", data);

export const joinCohort = (id: number): Promise<AxiosResponse<Cohort>> =>
    api.post<Cohort>(`/cohorts/${id}/join`);

export const leaveCohort = (id: number): Promise<AxiosResponse<void>> =>
    api.post<void>(`/cohorts/${id}/leave`);

export const getCohortMembers = (
    id: number,
): Promise<AxiosResponse<CohortMember[]>> =>
    api.get<CohortMember[]>(`/cohorts/${id}/members`);
