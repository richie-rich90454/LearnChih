import type { AxiosResponse } from "axios";
import api from "./axios";

export interface FeaturedBadge {
    userBadgeId: number;
    badgeId: number;
    name: string;
    description: string | null;
    icon: string | null;
    earnedAt: string;
}

export interface EarnedBadge extends FeaturedBadge {
    featured: boolean;
}

export const getFeaturedBadges = (
    userId: number,
): Promise<AxiosResponse<FeaturedBadge[]>> =>
    api.get<FeaturedBadge[]>(`/users/${userId}/featured-badges`);

export const getEarnedBadges = (): Promise<AxiosResponse<EarnedBadge[]>> =>
    api.get<EarnedBadge[]>("/users/me/earned-badges");

export const setFeaturedBadges = (
    badgeIds: number[],
): Promise<AxiosResponse<FeaturedBadge[]>> =>
    api.put<FeaturedBadge[]>("/users/me/featured-badges", { badgeIds });
