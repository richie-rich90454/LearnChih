import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export type SearchType = "all" | "resources" | "channels" | "users" | "posts";

/**
 * A single search hit. The shape is intentionally permissive because the
 * global search endpoint may return resources, threads, users, etc.
 * Spec ref: F2.13.
 */
export interface SearchResult {
    id: number;
    type: "resource" | "channel" | "post" | "user";
    title: string;
    snippet?: string;
    url: string;
    highlight?: string;
}

export interface SearchResponse {
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    page: number;
}

/**
 * Debounced global search against GET /api/search.
 * The query is disabled when the query string is empty.
 *
 * Spec ref: F2.13.
 */
export function useSearch(query: string, type: SearchType = "all", page = 0) {
    return useQuery<SearchResponse>({
        queryKey: ["search", query, type, page],
        queryFn: () => {
            const params: Record<string, string> = { q: query, page: String(page) };
            if (type !== "all") params.type = type;
            return api.get<SearchResponse>("/search", { params }).then((r) => r.data);
        },
        enabled: query.trim().length > 0,
        // Keep stale results visible while a new query is in-flight.
        placeholderData: (prev) => prev,
    });
}
