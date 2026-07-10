package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for note templates (F11). A template carries a name,
 * a TEXT body, and an optional category for grouping in the gallery.
 */
public final class NoteTemplateDtos {

    private NoteTemplateDtos() {
    }

    public record CreateNoteTemplateRequest(
            String name,
            String content,
            String category
    ) {
    }

    public record NoteTemplateResponse(
            Long id,
            Long userId,
            String name,
            String content,
            String category,
            LocalDateTime createdAt
    ) {
    }
}
