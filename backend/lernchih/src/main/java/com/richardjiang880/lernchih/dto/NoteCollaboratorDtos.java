package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for note collaborators (F14). A collaborator entry ties
 * a user to a note with a role ({@code OWNER}, {@code EDITOR}, or
 * {@code VIEWER}).
 */
public final class NoteCollaboratorDtos {

    private NoteCollaboratorDtos() {
    }

    public record AddCollaboratorRequest(
            Long userId,
            String role
    ) {
    }

    public record NoteCollaboratorResponse(
            Long id,
            Long noteId,
            Long userId,
            String userName,
            String role,
            LocalDateTime addedAt
    ) {
    }
}
