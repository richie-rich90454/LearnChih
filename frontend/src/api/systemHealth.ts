import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Aggregate system health snapshot returned by /api/admin/health (F93).
 * Mirrors the backend SystemHealthController response.
 */
export interface SystemHealth {
    dbStatus: string;
    memoryUsedMb: number;
    memoryMaxMb: number;
    diskFreeGb: number;
    uptimeMs: number;
    activeUserCount: number;
}

export const getSystemHealth = (): Promise<AxiosResponse<SystemHealth>> =>
    api.get<SystemHealth>("/admin/health");
