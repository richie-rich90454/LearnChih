import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Platform feature flag. Mirrors the FeatureFlag JPA entity that maps to
 * the feature_flags table. Admins toggle `enabled` to gate features
 * platform-wide.
 */
export interface FeatureFlag {
    id: number;
    flagKey: string;
    description: string | null;
    enabled: boolean;
    updatedAt: string;
    createdAt: string;
}

export const getFeatureFlags = (): Promise<AxiosResponse<FeatureFlag[]>> =>
    api.get<FeatureFlag[]>("/admin/feature-flags");

export const updateFeatureFlag = (
    key: string,
    enabled: boolean,
): Promise<AxiosResponse<FeatureFlag>> =>
    api.put<FeatureFlag>(`/admin/feature-flags/${key}`, { enabled });
