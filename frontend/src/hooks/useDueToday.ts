import { useQuery } from "@tanstack/react-query";
import { getDueToday, type DueTodayResponse } from "../api/dueToday";

/** Unified due-today review queue for the current user (F24). */
export function useDueToday() {
    return useQuery<DueTodayResponse>({
        queryKey: ["due-today"],
        queryFn: () => getDueToday().then((r) => r.data),
    });
}
