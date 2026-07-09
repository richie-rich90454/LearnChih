package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * A multiple-choice question belonging to a {@link Quiz}. Backed by the
 * {@code quiz_questions} table created in Flyway migration V11. Options are
 * stored as a JSON array string in {@code options_json}; {@code answer_index}
 * is the zero-based index of the correct option.
 */
@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "options_json", nullable = false, columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "answer_index", nullable = false)
    private Integer answerIndex;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
