package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Real-time note edit broadcast payload (F14). When a collaborator edits a note
 * via REST, the frontend also publishes this event to
 * {@code /app/notes/{id}/edit}; the WebSocket controller relays it to
 * {@code /topic/notes/{id}} so other collaborators see updates instantly,
 * without waiting for the 3-second poll.
 */
public record NoteEditEvent(
        Long noteId,
        Long userId,
        String userName,
        String title,
        String content,
        LocalDateTime updatedAt
) {
}
