package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A user-owned reusable multiple-choice question in the question bank (F18).
 * Backed by the {@code question_bank} table created in Flyway migration
 * V20260709010003. Each row stores the question text, options (JSON array
 * string), the correct option index, an explanation, and comma-separated
 * tags for search. Bank questions can be imported into any quiz, supporting
 * reuse across quizzes without re-typing.
 */
@Entity
@Table(name = "question_bank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "options_json", nullable = false, columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "answer_index", nullable = false)
    private Integer answerIndex;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false, length = 500)
    @Builder.Default
    private String tags = "";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (tags == null) {
            tags = "";
        }
    }
}
