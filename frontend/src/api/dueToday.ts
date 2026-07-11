import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * A single item in the unified due-today review queue (F24).
 * `type` determines the icon and destination route.
 */
export interface DueItem {
    type: "FLASHCARD" | "RESOURCE_REVIEW" | "QUIZ";
    id: number;
    title: string;
    subtitle: string;
    dueDate: string | null;
    destination: string;
}

export interface DueTodayResponse {
    items: DueItem[];
    totalCount: number;
}

/** Fetch the unified due-today queue for the current user (F24). */
export const getDueToday = (): Promise<AxiosResponse<DueTodayResponse>> =>
    api.get<DueTodayResponse>("/due-today");
