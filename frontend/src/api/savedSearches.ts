import type { AxiosResponse } from "axios";
import api from "./axios";

export interface SavedSearch {
    id: number;
    userId: number;
    name: string;
    query: string;
    emailAlerts: boolean;
    lastNotifiedAt: string | null;
    createdAt: string;
}

export interface CreateSavedSearchRequest {
    name?: string;
    query: string;
    emailAlerts?: boolean;
}

export interface UpdateSavedSearchRequest {
    name?: string;
    emailAlerts?: boolean;
}

/**
 * Saved searches with email alerts API (F34).
 */
export const getSavedSearches = (): Promise<AxiosResponse<SavedSearch[]>> =>
    api.get<SavedSearch[]>("/saved-searches");

export const createSavedSearch = (
    data: CreateSavedSearchRequest,
): Promise<AxiosResponse<SavedSearch>> =>
    api.post<SavedSearch>("/saved-searches", data);

export const updateSavedSearch = (
    id: number,
    data: UpdateSavedSearchRequest,
): Promise<AxiosResponse<SavedSearch>> =>
    api.put<SavedSearch>(`/saved-searches/${id}`, data);

export const deleteSavedSearch = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/saved-searches/${id}`);
