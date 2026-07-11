package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Aggregate statistics for a single {@link QuizQuestion}, used to compute
 * difficulty and discrimination (F17). Each quiz submission increments
 * {@code timesAttempted} for every answered question; {@code timesCorrect}
 * and the two score sums feed the analytics metrics.
 *
 * <p>Backed by the {@code quiz_question_stats} table created in Flyway
 * migration V20260709010002.
 */
@Entity
@Table(name = "quiz_question_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false, unique = true)
    private Long questionId;

    @Column(name = "times_attempted", nullable = false)
    @Builder.Default
    private int timesAttempted = 0;

    @Column(name = "times_correct", nullable = false)
    @Builder.Default
    private int timesCorrect = 0;

    @Column(name = "sum_score_correct", nullable = false)
    @Builder.Default
    private int sumScoreCorrect = 0;

    @Column(name = "sum_score_wrong", nullable = false)
    @Builder.Default
    private int sumScoreWrong = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
