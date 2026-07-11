import { useQuery } from "@tanstack/react-query";
import { getRecommendations, type RecommendationItem } from "../api/recommendations";

/** Recommended resources for the current user (F23). */
export function useRecommendations() {
    return useQuery<RecommendationItem[]>({
        queryKey: ["recommendations"],
        queryFn: () => getRecommendations().then((r) => r.data),
    });
}
