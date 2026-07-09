import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getFeaturedBadges,
    getEarnedBadges,
    setFeaturedBadges,
    type FeaturedBadge,
    type EarnedBadge,
} from "@/api/featuredBadges";

export function useFeaturedBadges(userId: number | undefined) {
    return useQuery<FeaturedBadge[]>({
        queryKey: ["featured-badges", userId],
        queryFn: () => getFeaturedBadges(userId!).then((r) => r.data),
        enabled: !!userId,
    });
}

export function useEarnedBadges(enabled: boolean) {
    return useQuery<EarnedBadge[]>({
        queryKey: ["earned-badges"],
        queryFn: () => getEarnedBadges().then((r) => r.data),
        enabled,
    });
}

export function useSetFeaturedBadges() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (badgeIds: number[]) =>
            setFeaturedBadges(badgeIds).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featured-badges"] });
            queryClient.invalidateQueries({ queryKey: ["earned-badges"] });
        },
    });
}
