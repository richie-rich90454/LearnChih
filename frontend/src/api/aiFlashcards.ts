import type { AxiosResponse } from "axios";
import api from "./axios";

export interface GeneratedFlashcard {
    front: string;
    back: string;
}

export interface GenerateFlashcardsResponse {
    cards: GeneratedFlashcard[];
}

export interface SaveFlashcardsResponse {
    deckId: number;
    savedCount: number;
}

/**
 * Trigger mock AI flashcard generation for a resource (F4). The backend
 * derives cloze-deletion cards from the resource's title + description.
 */
export const generateAiFlashcards = (
    resourceId: number,
): Promise<AxiosResponse<GenerateFlashcardsResponse>> =>
    api.post<GenerateFlashcardsResponse>(
        `/resources/${resourceId}/ai-flashcards/generate`,
    );

/**
 * Persist generated flashcards into a new deck owned by the current user (F4).
 */
export const saveAiFlashcards = (
    resourceId: number,
    deckName: string,
    cards: GeneratedFlashcard[],
): Promise<AxiosResponse<SaveFlashcardsResponse>> =>
    api.post<SaveFlashcardsResponse>(
        `/resources/${resourceId}/ai-flashcards/save`,
        { deckName, cards },
    );
