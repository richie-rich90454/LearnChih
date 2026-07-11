package com.richardjiang880.lernchih.dto;

import com.richardjiang880.lernchih.model.SharedDeck;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for the flashcard-deck sharing endpoints (F15).
 *
 * <p>Identifiers for the recipient are accepted either as an email or a
 * username (resolved case-insensitively on the backend). The permission
 * field uses the {@link SharedDeck.Permission} enum: {@code VIEW} or
 * {@code EDIT}.
 */
public final class SharedDeckDtos {

    private SharedDeckDtos() {
    }

    public record ShareRequest(
            String recipientEmailOrUsername,
            SharedDeck.Permission permission
    ) {
    }

    public record SharedDeckResponse(
            Long id,
            Long deckId,
            String deckName,
            Long sharedByUserId,
            String sharedByName,
            Long sharedWithUserId,
            String sharedWithName,
            SharedDeck.Permission permission,
            LocalDateTime sharedAt
    ) {
    }
}
