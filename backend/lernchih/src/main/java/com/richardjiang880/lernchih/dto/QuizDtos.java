package com.richardjiang880.lernchih.dto;

import com.richardjiang880.lernchih.model.Quiz;
import java.util.List;

/**
 * Request/response DTOs for the quiz-taking endpoints (F16). These back
 * {@code GET /api/quizzes}, {@code GET /api/quizzes/{id}}, and
 * {@code POST /api/quizzes/{id}/submit}, which let a user browse persisted
 * quizzes, fetch one with its questions, and submit answers for grading.
 *
 * <p>The single-quiz response reveals the correct option index per question
 * so the frontend can render immediate feedback for MASTERY and ADAPTIVE
 * modes without a round-trip per attempt.
 */
public final class QuizDtos {

    private QuizDtos() {
    }

    public record QuizQuestionResponse(
            Long id,
            Long quizId,
            String question,
            List<String> options,
            Integer correctOptionIndex,
            String explanation
    ) {
    }

    public record QuizResponse(
            Long id,
            String title,
            String description,
            Quiz.Mode mode,
            Integer timeLimitSeconds,
            Integer passingScore,
            List<QuizQuestionResponse> questions
    ) {
    }

    public record QuizAnswer(
            Long questionId,
            Integer selectedOptionIndex
    ) {
    }

    public record SubmitRequest(List<QuizAnswer> answers) {
    }

    public record AnswerDetail(
            Long questionId,
            Integer selectedOptionIndex,
            Integer correctOptionIndex,
            boolean correct
    ) {
    }

    public record SubmitResponse(
            Long quizId,
            int score,
            int totalQuestions,
            double percentage,
            boolean passed,
            List<AnswerDetail> details
    ) {
    }

    public record QuestionAnalytics(
            Long questionId,
            String question,
            int timesAttempted,
            int timesCorrect,
            double difficulty,
            double discrimination
    ) {
    }

    public record QuizAnalyticsResponse(
            Long quizId,
            String title,
            List<QuestionAnalytics> questions
    ) {
    }
}
