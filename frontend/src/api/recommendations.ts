import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * A single recommended resource returned by the content-based recommender
 * (F23). `score` is an opaque similarity rank used only for ordering.
 */
export interface RecommendationItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    category: string;
    type: string;
    subjectId: number | null;
    subjectName: string | null;
    upvoteCount: number;
    authorName: string | null;
    score: number;
    createdAt: string;
}

/** List recommended resources for the current user (F23). */
export const getRecommendations = (): Promise<AxiosResponse<RecommendationItem[]>> =>
    api.get<RecommendationItem[]>("/resources/recommendations");

/** Record that the current user viewed a resource, feeding the recommender (F23). */
export const recordResourceInteraction = (
    id: number,
): Promise<AxiosResponse<void>> => api.post<void>(`/resources/${id}/interact`);
