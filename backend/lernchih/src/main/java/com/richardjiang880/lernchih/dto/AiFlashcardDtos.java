package com.richardjiang880.lernchih.dto;

import java.util.List;

/**
 * Request/response DTOs for AI flashcard generation (F4). The generator
 * produces cloze-deletion flashcards from a resource's content; the save
 * endpoint persists them into a new {@code flashcard_decks} row.
 */
public final class AiFlashcardDtos {

    private AiFlashcardDtos() {
    }

    public record GeneratedFlashcard(String front, String back) {
    }

    public record GenerateResponse(List<GeneratedFlashcard> cards) {
    }

    public record SaveRequest(String deckName, List<GeneratedFlashcard> cards) {
    }

    public record SaveResponse(Long deckId, int savedCount) {
    }
}
