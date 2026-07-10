import type { AxiosResponse } from "axios";
import api from "./axios";

export type UserRole = "STUDENT" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

/**
 * Admin-facing user projection. Mirrors AdminUserController.UserSummary.
 * Excludes the password hash and lazy associations.
 */
export interface AdminUserSummary {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    verified: boolean;
    credits: number;
    createdAt: string;
}

/**
 * Generic Spring Data Page payload shape. The backend serializes a Page<T>
 * with content + pagination metadata.
 */
export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface AdminUsersParams {
    search?: string;
    page?: number;
    size?: number;
}

export const getAdminUsers = (
    params: AdminUsersParams,
): Promise<AxiosResponse<SpringPage<AdminUserSummary>>> =>
    api.get<SpringPage<AdminUserSummary>>("/admin/users", { params });

export const updateUserRole = (
    id: number,
    role: UserRole,
): Promise<AxiosResponse<AdminUserSummary>> =>
    api.put<AdminUserSummary>(`/admin/users/${id}/role`, { role });

export const updateUserStatus = (
    id: number,
    status: UserStatus,
): Promise<AxiosResponse<AdminUserSummary>> =>
    api.put<AdminUserSummary>(`/admin/users/${id}/status`, { status });

export const bulkUserAction = (
    action: "SUSPEND" | "ACTIVATE" | "DELETE",
    userIds: number[],
): Promise<AxiosResponse<{ processed: number }>> =>
    api.post<{ processed: number }>("/admin/users/bulk-action", { action, userIds });
