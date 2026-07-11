import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getApiKeys,
    createApiKey,
    revokeApiKey,
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
