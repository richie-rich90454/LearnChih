import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Platform system setting. Mirrors the SystemSetting JPA entity that maps
 * to the system_settings table. A generic key/value store where the value
 * is a free-form string (often JSON).
 */
export interface SystemSetting {
    id: number;
    settingKey: string;
    settingValue: string | null;
    updatedAt: string;
    createdAt: string;
}

/**
 * Parsed maintenance banner config, stored as JSON in the
 * `maintenance_banner` system setting's `settingValue`.
 */
export interface MaintenanceBannerConfig {
    enabled: boolean;
    message: string;
    level: "info" | "warning" | "error";
}

export const getSystemSetting = (
    key: string,
): Promise<AxiosResponse<SystemSetting>> =>
    api.get<SystemSetting>(`/system-settings/${key}`);

export const getSystemSettings = (): Promise<AxiosResponse<SystemSetting[]>> =>
    api.get<SystemSetting[]>("/admin/system-settings");

export const updateSystemSetting = (
    key: string,
    value: string,
): Promise<AxiosResponse<SystemSetting>> =>
    api.put<SystemSetting>(`/admin/system-settings/${key}`, { value });
