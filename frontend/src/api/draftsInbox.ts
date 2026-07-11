import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * A unified inbox row representing a draft composition (F64).
 * `contentType` is derived from the draft's post type, falling back
 * to NOTE for standalone compositions.
 */
export interface DraftItem {
    contentId: number;
    contentType: "NOTE" | "RESOURCE" | "CHANNEL";
    title: string;
    updatedAt: string;
}

export const getDraftsInbox = (): Promise<AxiosResponse<DraftItem[]>> =>
    api.get<DraftItem[]>("/drafts/inbox");
