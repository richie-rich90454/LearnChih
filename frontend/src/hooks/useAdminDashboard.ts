import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard, type AdminDashboard } from "../api/adminDashboard";

/**
 * Admin dashboard KPIs. Refreshed every 60s so the console reflects recent
 * signups / report activity without spamming the count queries.
 */
export function useAdminDashboard() {
    return useQuery<AdminDashboard>({
        queryKey: ["admin-dashboard"],
        queryFn: () => getAdminDashboard().then((r) => r.data),
        refetchInterval: 60_000,
    });
}
