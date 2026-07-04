import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

/**
 * A single flashcard belonging to a deck.
 * Spec ref: F6.49.
 */
export interface Flashcard {
    id: number;
    deckId: number;
    front: string;
    back: string;
    /** SM-2 ease factor (default 2.5). */
    easeFactor?: number;
    /** Current interval in days. */
    interval?: number;
    /** Repetition count. */
    repetitions?: number;
    /** ISO timestamp of next due review. */
    dueAt?: string;
}

/**
 * A deck of flashcards.
 * Spec ref: F6.49.
 */
export interface Deck {
    id: number;
    name: string;
    description?: string;
    cardCount: number;
    /** Cards currently due for review. */
    dueCount?: number;
}

/**
 * SM-2 rating values. `AGAIN` resets the card, the others advance it.
 * Spec ref: F6.50.
 */
export type CardRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface RateCardRequest {
    rating: CardRating;
}

export interface StudySession {
    deckId: number;
    cards: Flashcard[];
}

/** Lists all decks for the current user. Spec ref: F6.49. */
export function useDecks() {
    return useQuery<Deck[]>({
        queryKey: ["decks"],
        queryFn: () => api.get<Deck[]>("/flashcards/decks").then((r) => r.data),
    });
}

/** Fetches a single deck. Spec ref: F6.49. */
export function useDeck(id: string | number | undefined) {
    return useQuery<Deck>({
        queryKey: ["deck", id],
        queryFn: () => api.get<Deck>(`/flashcards/decks/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}

/**
 * Starts a study session: returns the cards due for review in this deck.
 * Spec ref: F6.50.
 */
export function useStudyDeck(id: string | number | undefined) {
    return useQuery<StudySession>({
        queryKey: ["studyDeck", id],
        queryFn: () => api.get<StudySession>(`/flashcards/decks/${id}/study`).then((r) => r.data),
        enabled: !!id,
    });
}

/**
 * Rates a card after review. The server applies the SM-2 algorithm and
 * returns the updated scheduling. Call `.mutate(rating)`.
 * Spec ref: F6.50.
 */
export function useRateCard(cardId: string | number | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rating: CardRating): Promise<AxiosResponse<Flashcard>> =>
            api.post<Flashcard>(`/flashcards/cards/${cardId}/rate`, {
                rating,
            } satisfies RateCardRequest),
        onSuccess: () => {
            // Invalidate the active study session and deck stats.
            queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
            queryClient.invalidateQueries({ queryKey: ["decks"] });
            queryClient.invalidateQueries({ queryKey: ["deck"] });
        },
    });
}
