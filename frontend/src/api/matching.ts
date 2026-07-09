import type { AxiosResponse } from "axios";
import api from "./axios";

export interface BuddySuggestion {
    matchId: number;
    buddyId: number;
    buddyName: string | null;
    matchScore: number;
    sharedSubjectCount: number;
    status: string;
}

export const getSuggestions = (): Promise<AxiosResponse<BuddySuggestion[]>> =>
    api.get<BuddySuggestion[]>("/matching/suggestions");

export const dismissSuggestion = (
    matchId: number,
): Promise<AxiosResponse<void>> =>
    api.post<void>(`/matching/${matchId}/dismiss`);

export const markConnected = (
    buddyId: number,
): Promise<AxiosResponse<void>> =>
    api.post<void>(`/matching/connected/${buddyId}`);
