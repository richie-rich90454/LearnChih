package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for notes (F9). A note owns a title and free-form
 * TEXT content that may contain `[[wikilink]]` references to other note titles.
 */
public final class NoteDtos {

    private NoteDtos() {
    }

    public record CreateNoteRequest(
            String title,
            String content,
            Long subjectId
    ) {
    }

    public record UpdateNoteRequest(
            String title,
            String content,
            Long subjectId
    ) {
    }

    public record NoteResponse(
            Long id,
            Long userId,
            String title,
            String content,
            Long subjectId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }
}
