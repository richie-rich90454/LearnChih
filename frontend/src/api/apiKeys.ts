import type { AxiosResponse } from "axios";
import api from "./axios";

/** Scope granted to an API key. */
export type ApiKeyScope = "read" | "write" | "admin";

/** API key as exposed by the admin endpoints (never contains the raw key). */
export interface ApiKey {
    id: number;
    userId: number;
    name: string;
    prefix: string;
    scopes: ApiKeyScope[];
    revoked: boolean;
    createdAt: string;
    revokedAt: string | null;
    lastUsedAt: string | null;
}

/** Returned once, immediately after creating a key, so it can be copied. */
export interface CreatedApiKey {
    key: ApiKey;
    plaintext: string;
}

export const getApiKeys = (userId?: number): Promise<AxiosResponse<ApiKey[]>> =>
    api.get<ApiKey[]>("/admin/api-keys", { params: userId ? { userId } : {} });

export const createApiKey = (
    name: string,
    scopes: ApiKeyScope[],
): Promise<AxiosResponse<CreatedApiKey>> =>
    api.post<CreatedApiKey>("/admin/api-keys", { name, scopes });

export const revokeApiKey = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/admin/api-keys/${id}`);

/** Per-key rate-limit quota (F95). */
export interface ApiKeyRateLimit {
    id: number;
    apiKeyId: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    updatedAt: string | null;
}

/** Live usage counters for a single API key (sliding window). */
export interface ApiKeyUsage {
    minute: number;
    hour: number;
    day: number;
    total: number;
}

export const getApiKeyRateLimit = (
    id: number,
): Promise<AxiosResponse<ApiKeyRateLimit | null>> =>
    api.get<ApiKeyRateLimit | null>(`/admin/api-keys/${id}/rate-limit`);

export const setApiKeyRateLimit = (
    id: number,
    data: {
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
    },
): Promise<AxiosResponse<ApiKeyRateLimit>> =>
    api.put<ApiKeyRateLimit>(`/admin/api-keys/${id}/rate-limit`, data);

export const getApiKeyUsage = (
    id: number,
): Promise<AxiosResponse<ApiKeyUsage>> =>
    api.get<ApiKeyUsage>(`/admin/api-keys/${id}/usage`);
