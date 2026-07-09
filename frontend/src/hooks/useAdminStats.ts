import { useQuery } from "@tanstack/react-query";
import { getAdminStats, type AdminStats } from "../api/adminStats";

/**
 * Admin dashboard KPIs. Refreshed every 60s so the console reflects recent
 * signups / report activity without spamming the count queries.
 */
export function useAdminStats() {
    return useQuery<AdminStats>({
        queryKey: ["admin-stats"],
        queryFn: () => getAdminStats().then((r) => r.data),
        refetchInterval: 60_000,
    });
}
