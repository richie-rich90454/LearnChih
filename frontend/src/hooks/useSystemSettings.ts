import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import {
    getSystemSetting,
    getSystemSettings,
    updateSystemSetting,
} from "../api/systemSettings";

const MAINTENANCE_BANNER_KEY = ["system-settings", "maintenance_banner"] as const;
const SYSTEM_SETTINGS_KEY = ["system-settings"] as const;

/**
 * Fetches the maintenance banner setting. Only runs when the user has an
 * auth token — the read endpoint requires authentication, and calling it
 * unauthenticated would trigger the global 401 redirect handler.
 */
export function useMaintenanceBanner() {
    const token = useAuthStore((s) => s.token);
    return useQuery({
        queryKey: MAINTENANCE_BANNER_KEY,
        queryFn: () => getSystemSetting("maintenance_banner").then((r) => r.data),
        enabled: !!token,
        retry: false,
        staleTime: 60 * 1000,
    });
}

export function useSystemSettings() {
    return useQuery({
        queryKey: SYSTEM_SETTINGS_KEY,
        queryFn: () => getSystemSettings().then((r) => r.data),
    });
}

export function useUpdateSystemSetting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            updateSystemSetting(key, value).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: SYSTEM_SETTINGS_KEY });
            qc.invalidateQueries({ queryKey: ["system-settings"] });
        },
    });
}
