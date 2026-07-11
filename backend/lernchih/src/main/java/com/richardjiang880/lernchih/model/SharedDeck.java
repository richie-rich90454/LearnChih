package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Sharing relationship between an owner ({@code sharedByUserId}) and a
 * recipient ({@code sharedWithUserId}) for a {@link FlashcardDeck}. Permission
 * scopes what the recipient can do: {@code VIEW} (read-only review) or
 * {@code EDIT} (add/remove cards).
 *
 * <p>Created for F15 (Flashcard deck sharing). Backed by the
 * {@code shared_decks} table created in Flyway migration V20260708200007.
 */
@Entity
@Table(name = "shared_decks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDeck {

    public enum Permission {
        VIEW,
        EDIT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "shared_by_user_id", nullable = false)
    private Long sharedByUserId;

    @Column(name = "shared_with_user_id", nullable = false)
    private Long sharedWithUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Permission permission = Permission.VIEW;

    @Column(name = "shared_at", nullable = false, updatable = false)
    private LocalDateTime sharedAt;

    @PrePersist
    protected void onCreate() {
        sharedAt = LocalDateTime.now();
        if (permission == null) {
            permission = Permission.VIEW;
        }
    }
}
