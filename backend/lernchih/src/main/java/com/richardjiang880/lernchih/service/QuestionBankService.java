package com.richardjiang880.lernchih.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.richardjiang880.lernchih.dto.QuestionBankDtos.ImportResponse;
import com.richardjiang880.lernchih.dto.QuestionBankDtos.QuestionBankRequest;
import com.richardjiang880.lernchih.dto.QuestionBankDtos.QuestionBankResponse;
import com.richardjiang880.lernchih.model.QuestionBank;
import com.richardjiang880.lernchih.model.Quiz;
import com.richardjiang880.lernchih.model.QuizQuestion;
import com.richardjiang880.lernchih.repository.QuestionBankRepository;
import com.richardjiang880.lernchih.repository.QuizQuestionRepository;
import com.richardjiang880.lernchih.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * CRUD + search + import service for the question bank (F18). Each user owns
 * a private bank of reusable multiple-choice questions. A bank question can
 * be imported into an existing quiz, which copies its content into a new
 * {@code quiz_questions} row so the quiz stays self-contained.
 */
@Service
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;

    public QuestionBankService(QuestionBankRepository questionBankRepository,
                               QuizRepository quizRepository,
                               QuizQuestionRepository quizQuestionRepository,
                               ObjectMapper objectMapper) {
        this.questionBankRepository = questionBankRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<QuestionBankResponse> list(Long userId, String tag, String query) {
        List<QuestionBank> rows;
        if (tag != null && !tag.isBlank()) {
            rows = questionBankRepository.findByOwnerUserIdAndTagsContainingIgnoreCaseOrderByCreatedAtDesc(
                    userId, tag.trim());
        } else if (query != null && !query.isBlank()) {
            rows = questionBankRepository.findByOwnerUserIdAndQuestionContainingIgnoreCaseOrderByCreatedAtDesc(
                    userId, query.trim());
        } else {
            rows = questionBankRepository.findByOwnerUserIdOrderByCreatedAtDesc(userId);
        }
        List<QuestionBankResponse> out = new ArrayList<>(rows.size());
        for (QuestionBank q : rows) {
            out.add(toResponse(q));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public QuestionBankResponse get(Long userId, Long id) {
        QuestionBank q = questionBankRepository.findById(id).orElse(null);
        if (q == null || !q.getOwnerUserId().equals(userId)) {
            return null;
        }
        return toResponse(q);
    }

    @Transactional
    public QuestionBankResponse create(Long userId, QuestionBankRequest request) {
        validate(request);
        QuestionBank q = QuestionBank.builder()
                .ownerUserId(userId)
                .question(request.question().trim())
                .optionsJson(toJson(request.options()))
                .answerIndex(request.answerIndex())
                .explanation(request.explanation())
                .tags(normalizeTags(request.tags()))
                .build();
        q = questionBankRepository.save(q);
        return toResponse(q);
    }

    @Transactional
    public QuestionBankResponse update(Long userId, Long id, QuestionBankRequest request) {
        validate(request);
        QuestionBank q = questionBankRepository.findById(id).orElse(null);
        if (q == null || !q.getOwnerUserId().equals(userId)) {
            return null;
        }
        q.setQuestion(request.question().trim());
        q.setOptionsJson(toJson(request.options()));
        q.setAnswerIndex(request.answerIndex());
        q.setExplanation(request.explanation());
        q.setTags(normalizeTags(request.tags()));
        q = questionBankRepository.save(q);
        return toResponse(q);
    }

    @Transactional
    public boolean delete(Long userId, Long id) {
        QuestionBank q = questionBankRepository.findById(id).orElse(null);
        if (q == null || !q.getOwnerUserId().equals(userId)) {
            return false;
        }
        questionBankRepository.delete(q);
        return true;
    }

    /**
     * Copies a bank question into an existing quiz as a new
     * {@code quiz_questions} row. The bank entry is left untouched so it can
     * be imported again into other quizzes.
     */
    @Transactional
    public ImportResponse importIntoQuiz(Long userId, Long id, Long quizId) {
        QuestionBank q = questionBankRepository.findById(id).orElse(null);
        if (q == null || !q.getOwnerUserId().equals(userId)) {
            return null;
        }
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) {
            throw new IllegalArgumentException("Quiz not found: " + quizId);
        }
        QuizQuestion created = quizQuestionRepository.save(QuizQuestion.builder()
                .quizId(quiz.getId())
                .question(q.getQuestion())
                .optionsJson(q.getOptionsJson())
                .answerIndex(q.getAnswerIndex())
                .explanation(q.getExplanation())
                .build());
        return new ImportResponse(created.getId(), quiz.getId());
    }

    private void validate(QuestionBankRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Question is required");
        }
        if (request.question() == null || request.question().isBlank()) {
            throw new IllegalArgumentException("Question text is required");
        }
        if (request.options() == null || request.options().size() < 2) {
            throw new IllegalArgumentException("At least two options are required");
        }
        if (request.answerIndex() == null
                || request.answerIndex() < 0
                || request.answerIndex() >= request.options().size()) {
            throw new IllegalArgumentException("Answer index is out of range");
        }
    }

    private String normalizeTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return "";
        }
        String[] parts = tags.split(",");
        List<String> cleaned = new ArrayList<>();
        for (String p : parts) {
            String c = p.trim();
            if (!c.isEmpty()) {
                cleaned.add(c);
            }
        }
        return String.join(", ", cleaned);
    }

    private String toJson(List<String> options) {
        try {
            return objectMapper.writeValueAsString(options);
        } catch (Exception e) {
            return "[]";
        }
    }

    private QuestionBankResponse toResponse(QuestionBank q) {
        return new QuestionBankResponse(
                q.getId(),
                q.getOwnerUserId(),
                q.getQuestion(),
                parseOptions(q.getOptionsJson()),
                q.getAnswerIndex(),
                q.getExplanation(),
                q.getTags(),
                q.getCreatedAt());
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
