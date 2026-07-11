package com.richardjiang880.lernchih.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.richardjiang880.lernchih.dto.QuizDtos.AnswerDetail;
import com.richardjiang880.lernchih.dto.QuizDtos.QuizAnswer;
import com.richardjiang880.lernchih.dto.QuizDtos.QuizQuestionResponse;
import com.richardjiang880.lernchih.dto.QuizDtos.QuizResponse;
import com.richardjiang880.lernchih.dto.QuizDtos.SubmitRequest;
import com.richardjiang880.lernchih.dto.QuizDtos.SubmitResponse;
import com.richardjiang880.lernchih.model.Quiz;
import com.richardjiang880.lernchih.model.QuizQuestion;
import com.richardjiang880.lernchih.repository.QuizQuestionRepository;
import com.richardjiang880.lernchih.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Read + grading service for persisted quizzes (F16). Backs the
 * {@code /api/quizzes} endpoints: listing quizzes, fetching one with its
 * questions (revealing the correct option so MASTERY/ADAPTIVE modes can give
 * immediate client-side feedback), and grading a submission.
 *
 * <p>The pass threshold is 60%.
 */
@Service
public class QuizService {

    private static final double PASS_THRESHOLD = 0.6;

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository,
                       ObjectMapper objectMapper) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> listQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        List<QuizResponse> out = new ArrayList<>(quizzes.size());
        for (Quiz q : quizzes) {
            out.add(toResponse(q, quizQuestionRepository.findByQuizId(q.getId()), false));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null) {
            return null;
        }
        return toResponse(quiz, quizQuestionRepository.findByQuizId(id), true);
    }

    @Transactional
    public SubmitResponse submit(Long userId, Long quizId, SubmitRequest request) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            return null;
        }
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);
        Map<Long, QuizQuestion> byId = new HashMap<>();
        for (QuizQuestion q : questions) {
            byId.put(q.getId(), q);
        }

        List<AnswerDetail> details = new ArrayList<>();
        int score = 0;
        List<QuizAnswer> answers = request == null || request.answers() == null
                ? Collections.emptyList()
                : request.answers();

        for (QuizAnswer ans : answers) {
            QuizQuestion q = byId.get(ans.questionId());
            if (q == null) {
                continue;
            }
            boolean correct = ans.selectedOptionIndex() != null
                    && ans.selectedOptionIndex().equals(q.getAnswerIndex());
            if (correct) {
                score++;
            }
            details.add(new AnswerDetail(
                    q.getId(),
                    ans.selectedOptionIndex(),
                    q.getAnswerIndex(),
                    correct));
        }

        int total = questions.size();
        double pct = total == 0 ? 0.0 : (score * 100.0) / total;
        boolean passed = total > 0 && pct >= PASS_THRESHOLD * 100.0;
        return new SubmitResponse(quizId, score, total, pct, passed, details);
    }

    private QuizResponse toResponse(Quiz quiz, List<QuizQuestion> questions, boolean revealAnswers) {
        List<QuizQuestionResponse> qrs = new ArrayList<>(questions.size());
        for (QuizQuestion q : questions) {
            qrs.add(new QuizQuestionResponse(
                    q.getId(),
                    q.getQuizId(),
                    q.getQuestion(),
                    parseOptions(q.getOptionsJson()),
                    revealAnswers ? q.getAnswerIndex() : null,
                    q.getExplanation()));
        }
        return new QuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getMode(),
                quiz.getTimeLimitSeconds(),
                (int) Math.round(PASS_THRESHOLD * 100),
                qrs);
    }

    private List<String> parseOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
