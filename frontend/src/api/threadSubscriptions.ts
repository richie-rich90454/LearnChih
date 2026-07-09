import type { AxiosResponse } from "axios";
import api from "./axios";

export type DigestFrequency = "NONE" | "INSTANT" | "DAILY" | "WEEKLY";

export interface ThreadSubscriptionInfo {
    id: number | null;
    userId: number;
    threadId: number;
    frequency: DigestFrequency;
    lastDigestAt: string | null;
}

export interface UpdateSubscriptionRequest {
    frequency: DigestFrequency;
}

/**
 * Per-thread subscription API (F33).
 */
export const getSubscription = (
    threadId: number,
): Promise<AxiosResponse<ThreadSubscriptionInfo>> =>
    api.get<ThreadSubscriptionInfo>(`/threads/${threadId}/subscription`);

export const updateSubscription = (
    threadId: number,
    data: UpdateSubscriptionRequest,
): Promise<AxiosResponse<ThreadSubscriptionInfo>> =>
    api.put<ThreadSubscriptionInfo>(`/threads/${threadId}/subscription`, data);

export const deleteSubscription = (
    threadId: number,
): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/threads/${threadId}/subscription`);
