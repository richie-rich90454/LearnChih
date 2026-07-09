import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Aggregate KPIs surfaced on the admin dashboard. Mirrors the
 * AdminStatsController.AdminStatsDto record on the backend.
 */
export interface AdminStats {
    totalUsers: number;
    activeUsersToday: number;
    totalResources: number;
    totalPosts: number;
    pendingReports: number;
    newSignupsThisWeek: number;
}

export const getAdminStats = (): Promise<AxiosResponse<AdminStats>> =>
    api.get<AdminStats>("/admin/stats");
