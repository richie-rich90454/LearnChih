package com.richardjiang880.lernchih.dto;

import java.util.List;
import com.richardjiang880.lernchih.model.Quiz;

/**
 * Request/response DTOs for AI quiz generation (F5). The generator produces
 * multiple-choice questions from a resource's content; the save endpoint
 * persists them into a new {@code quizzes} row with linked
 * {@code quiz_questions}. Since F16 the save request also carries the quiz
 * {@link Quiz.Mode mode} and an optional time limit for TIMED quizzes.
 */
public final class AiQuizDtos {

    private AiQuizDtos() {
    }

    public record GeneratedQuizQuestion(
            String question,
            List<String> options,
            int answerIndex,
            String explanation
    ) {
    }

    public record GenerateResponse(List<GeneratedQuizQuestion> questions) {
    }

    public record SaveRequest(
            String quizTitle,
            List<GeneratedQuizQuestion> questions,
            Quiz.Mode mode,
            Integer timeLimitSeconds
    ) {
    }

    public record SaveResponse(Long quizId, int savedCount) {
    }
}
