import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getApiKeys,
    createApiKey,
    revokeApiKey,
    getApiKeyRateLimit,
    setApiKeyRateLimit,
    getApiKeyUsage,
    type ApiKeyScope,
} from "../api/apiKeys";

const API_KEYS_KEY = ["admin-api-keys"] as const;

export function useAdminApiKeys(userId?: number) {
    return useQuery({
        queryKey: userId ? [...API_KEYS_KEY, "user", userId] : [...API_KEYS_KEY],
        queryFn: () => getApiKeys(userId).then((r) => r.data),
    });
}

export function useCreateApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ name, scopes }: { name: string; scopes: ApiKeyScope[] }) =>
            createApiKey(name, scopes).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: API_KEYS_KEY }),
    });
}

export function useRevokeApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => revokeApiKey(id).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: API_KEYS_KEY }),
    });
}

export function useApiKeyRateLimit(id: number | null) {
    return useQuery({
        queryKey: [...API_KEYS_KEY, "rate-limit", id],
        queryFn: () => getApiKeyRateLimit(id!).then((r) => r.data),
        enabled: id !== null,
    });
}

export function useSetApiKeyRateLimit() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            id: number;
            requestsPerMinute: number;
            requestsPerHour: number;
            requestsPerDay: number;
        }) => setApiKeyRateLimit(vars.id, vars).then((r) => r.data),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: [...API_KEYS_KEY, "rate-limit", vars.id] });
            qc.invalidateQueries({ queryKey: [...API_KEYS_KEY, "usage", vars.id] });
        },
    });
}

export function useApiKeyUsage(id: number | null) {
    return useQuery({
        queryKey: [...API_KEYS_KEY, "usage", id],
        queryFn: () => getApiKeyUsage(id!).then((r) => r.data),
        enabled: id !== null,
        refetchInterval: 5000,
    });
}
