import type { AxiosResponse } from "axios";
import api from "./axios";

export interface ReviewSchedule {
    id: number;
    userId: number;
    resourceId: number;
    resourceTitle: string;
    dueDate: string;
    intervalDays: number;
    easeFactor: number;
    reviewCount: number;
    createdAt: string;
}

export interface ScheduleRequest {
    resourceId: number;
}

export interface CompleteRequest {
    quality?: number;
}

export const scheduleReview = (
    data: ScheduleRequest,
): Promise<AxiosResponse<ReviewSchedule>> =>
    api.post<ReviewSchedule>("/review/schedule", data);

export const getDueReviews = (): Promise<AxiosResponse<ReviewSchedule[]>> =>
    api.get<ReviewSchedule[]>("/review/due");

export const getUpcomingReviews = (): Promise<AxiosResponse<ReviewSchedule[]>> =>
    api.get<ReviewSchedule[]>("/review/upcoming");

export const completeReview = (
    id: number,
    data?: CompleteRequest,
): Promise<AxiosResponse<ReviewSchedule>> =>
    api.post<ReviewSchedule>(`/review/complete/${id}`, data ?? {});
