import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeatureFlags, updateFeatureFlag } from "../api/featureFlags";

const FEATURE_FLAGS_KEY = ["feature-flags"] as const;

export function useFeatureFlags() {
    return useQuery({
        queryKey: FEATURE_FLAGS_KEY,
        queryFn: () => getFeatureFlags().then((r) => r.data),
    });
}

export function useUpdateFeatureFlag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
            updateFeatureFlag(key, enabled).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: FEATURE_FLAGS_KEY }),
    });
}
