import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Full admin dashboard KPI payload. Mirrors
 * AdminDashboardController.DashboardDto on the backend.
 */
export interface AdminDashboard {
    totalUsers: number;
    activeUsersToday: number;
    totalResources: number;
    totalThreads: number;
    totalPosts: number;
    newSignupsThisWeek: number;
    reportedContentCount: number;
}

export const getAdminDashboard = (): Promise<AxiosResponse<AdminDashboard>> =>
    api.get<AdminDashboard>("/admin/dashboard");
