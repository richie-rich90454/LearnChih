import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Admin audit log entry. Mirrors the AuditLog JPA entity that maps to the
 * audit_logs table. Records who (actorId) did what (action) to which entity
 * (targetType/targetId), with optional JSON details and the originating IP.
 */
export interface AuditLogEntry {
    id: number;
    actorId: number | null;
    action: string;
    targetType: string | null;
    targetId: number | null;
    detailsJson: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface AuditLogParams {
    action?: string;
    page?: number;
    size?: number;
}

export const getAuditLogs = (
    params: AuditLogParams,
): Promise<AxiosResponse<SpringPage<AuditLogEntry>>> =>
    api.get<SpringPage<AuditLogEntry>>("/admin/audit-log", { params });
