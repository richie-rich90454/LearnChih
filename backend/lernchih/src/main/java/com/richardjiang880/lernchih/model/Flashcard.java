package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * A single flashcard belonging to a {@link FlashcardDeck}. Backed by the
 * {@code flashcards} table created in Flyway migration V11. Carries SM-2
 * spaced-repetition fields so saved cards can flow into the review calendar.
 */
@Entity
@Table(name = "flashcards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String front;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String back;

    @Column(name = "ease_factor", nullable = false)
    private Float easeFactor;

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays;

    @Column(nullable = false)
    private Integer repetitions;

    @Column(name = "next_review")
    private LocalDate nextReview;

    @PrePersist
    protected void onCreate() {
        if (easeFactor == null) {
            easeFactor = 2.5f;
        }
        if (intervalDays == null) {
            intervalDays = 1;
        }
        if (repetitions == null) {
            repetitions = 0;
        }
        if (nextReview == null) {
            nextReview = LocalDate.now().plusDays(1);
        }
    }
}
