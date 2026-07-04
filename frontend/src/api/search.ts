import type { AxiosResponse } from "axios";
import api from "./axios";
import type { SearchResponse } from "../hooks/useSearch";

/**
 * Global search endpoint returning resources, channels, users, and posts.
 * Spec ref: F2.13.
 */
export const searchResourcesAndChannels = (
    query: string,
    page = 0,
): Promise<AxiosResponse<SearchResponse>> =>
    api.get<SearchResponse>("/search", {
        params: { q: query, page: String(page) },
    });

export default searchResourcesAndChannels;
