import type { AxiosResponse } from "axios";
import api from "./axios";

export type ModerationStatus = "PENDING" | "RESOLVED" | "DISMISSED";

/**
 * Admin moderation queue item. Mirrors the ModerationItem JPA entity that
 * maps to the mod_queue table. SLA tracking is via slaDeadline (24h from
 * creation by default) and resolvedAt (null until closed).
 */
export interface ModerationItem {
    id: number;
    contentType: string;
    contentId: number;
    reportedBy: number | null;
    reason: string;
    status: ModerationStatus;
    assignedTo: number | null;
    slaDeadline: string;
    resolvedAt: string | null;
    createdAt: string;
}

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ModerationQueueParams {
    status?: ModerationStatus;
    page?: number;
    size?: number;
}

export const getModerationItems = (
    params: ModerationQueueParams,
): Promise<AxiosResponse<SpringPage<ModerationItem>>> =>
    api.get<SpringPage<ModerationItem>>("/admin/moderation", { params });

export const assignModerationItem = (
    id: number,
): Promise<AxiosResponse<ModerationItem>> =>
    api.put<ModerationItem>(`/admin/moderation/${id}/assign`);

export const resolveModerationItem = (
    id: number,
): Promise<AxiosResponse<ModerationItem>> =>
    api.put<ModerationItem>(`/admin/moderation/${id}/resolve`);

export const dismissModerationItem = (
    id: number,
): Promise<AxiosResponse<ModerationItem>> =>
    api.put<ModerationItem>(`/admin/moderation/${id}/dismiss`);
