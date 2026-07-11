import type { AxiosResponse } from "axios";
import api from "./axios";

/**
 * Permission level for a shared deck. VIEW = read-only review, EDIT = the
 * recipient can also add or remove cards. Spec ref: F15.
 */
export type SharedDeckPermission = "VIEW" | "EDIT";

export interface SharedDeck {
    id: number;
    deckId: number;
    deckName: string | null;
    sharedByUserId: number;
    sharedByName: string | null;
    sharedWithUserId: number;
    sharedWithName: string | null;
    permission: SharedDeckPermission;
    sharedAt: string;
}

export interface ShareDeckRequest {
    recipientEmailOrUsername: string;
    permission: SharedDeckPermission;
}

/**
 * Share a deck owned by the current user with another user identified by
 * email or username (F15). The backend resolves the recipient and upserts
 * the share row so re-sharing the same deck updates the permission.
 */
export const shareDeck = (
    deckId: number,
    data: ShareDeckRequest,
): Promise<AxiosResponse<SharedDeck>> =>
    api.post<SharedDeck>(`/flashcard-decks/${deckId}/share`, data);

/** List decks other users have shared with the current user (F15). */
export const getSharedWithMe = (): Promise<AxiosResponse<SharedDeck[]>> =>
    api.get<SharedDeck[]>("/flashcard-decks/shared-with-me");

/** List decks the current user has shared with others (F15). */
export const getSharedByMe = (): Promise<AxiosResponse<SharedDeck[]>> =>
    api.get<SharedDeck[]>("/flashcard-decks/shared-by-me");

/** Revoke a share (F15). Both the owner and the recipient may revoke. */
export const revokeSharedDeck = (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/shared-decks/${id}`);
