package com.richardjiang880.lernchih.service;

import tools.jackson.databind.ObjectMapper;
import com.richardjiang880.lernchih.dto.AiQuizDtos.GeneratedQuizQuestion;
import com.richardjiang880.lernchih.dto.AiQuizDtos.GenerateResponse;
import com.richardjiang880.lernchih.dto.AiQuizDtos.SaveRequest;
import com.richardjiang880.lernchih.dto.AiQuizDtos.SaveResponse;
import com.richardjiang880.lernchih.model.Quiz;
import com.richardjiang880.lernchih.model.QuizQuestion;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.QuizQuestionRepository;
import com.richardjiang880.lernchih.repository.QuizRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * Mock AI quiz generator (F5). Rather than calling an external LLM, this
 * service derives multiple-choice questions deterministically from a
 * resource's title and description: each sufficiently long sentence becomes a
 * fill-in-the-blank question whose answer is the longest content word, with
 * distractors drawn from the rest of the corpus. Generated questions can then
 * be persisted via {@link #save}.
 */
@Service
public class AiQuizService {

    private static final int MAX_QUESTIONS = 5;
    private static final int OPTION_COUNT = 4;

    private final ResourceRepository resourceRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;

    public AiQuizService(ResourceRepository resourceRepository,
                         QuizRepository quizRepository,
                         QuizQuestionRepository quizQuestionRepository,
                         ObjectMapper objectMapper) {
        this.resourceRepository = resourceRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public GenerateResponse generate(Long userId, Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId).orElse(null);
        return new GenerateResponse(buildQuestions(resource));
    }

    @Transactional
    public SaveResponse save(Long userId, Long resourceId, SaveRequest request) {
        if (request == null || request.questions() == null || request.questions().isEmpty()) {
            throw new IllegalArgumentException("No quiz questions to save");
        }
        String title = (request.quizTitle() == null || request.quizTitle().isBlank())
                ? "AI Quiz"
                : request.quizTitle().trim();

        Quiz.Mode mode = request.mode() == null ? Quiz.Mode.TIMED : request.mode();
        Quiz quiz = Quiz.builder()
                .title(title)
                .mode(mode)
                .timeLimitSeconds(request.timeLimitSeconds())
                .build();
        quiz = quizRepository.save(quiz);

        List<QuizQuestion> toSave = new ArrayList<>();
        for (GeneratedQuizQuestion q : request.questions()) {
            if (q == null || q.options() == null || q.options().isEmpty()) {
                continue;
            }
            toSave.add(QuizQuestion.builder()
                    .quizId(quiz.getId())
                    .question(q.question())
                    .optionsJson(toJson(q.options()))
                    .answerIndex(q.answerIndex())
                    .explanation(q.explanation())
                    .build());
        }
        quizQuestionRepository.saveAll(toSave);
        return new SaveResponse(quiz.getId(), toSave.size());
    }

    private String toJson(List<String> options) {
        try {
            return objectMapper.writeValueAsString(options);
        } catch (Exception e) {
            return "[]";
        }
    }

    /**
     * Deterministic MCQ builder. Splits the resource's title + description
     * into sentences; for each sentence with at least four words, masks the
     * longest content word to form a fill-in-the-blank question with three
     * distractors drawn from the corpus's other content words.
     */
    private List<GeneratedQuizQuestion> buildQuestions(Resource resource) {
        List<GeneratedQuizQuestion> questions = new ArrayList<>();
        if (resource == null) {
            return questions;
        }
        String title = resource.getTitle();
        String description = resource.getDescription();

        StringBuilder corpus = new StringBuilder();
        if (title != null && !title.isBlank()) {
            corpus.append(title.trim()).append(". ");
        }
        if (description != null && !description.isBlank()) {
            corpus.append(description.trim());
        }
        if (corpus.length() == 0) {
            return questions;
        }

        LinkedHashSet<String> pool = new LinkedHashSet<>();
        for (String w : corpus.toString().split("\\s+")) {
            String cleaned = stripPunct(w);
            if (cleaned.length() >= 4) {
                pool.add(cleaned);
            }
        }

        String[] sentences = corpus.toString().split("(?<=[.!?])\\s+");
        int qIndex = 0;
        for (String raw : sentences) {
            if (questions.size() >= MAX_QUESTIONS) {
                break;
            }
            String sentence = raw.trim();
            if (sentence.isEmpty()) {
                continue;
            }
            String[] words = sentence.split("\\s+");
            if (words.length < 4) {
                continue;
            }
            int targetIdx = pickLongestWord(words);
            if (targetIdx < 0) {
                continue;
            }
            String answer = stripPunct(words[targetIdx]);
            if (answer.length() < 4) {
                continue;
            }

            List<String> distractors = new ArrayList<>();
            for (String w : pool) {
                if (!w.equalsIgnoreCase(answer) && distractors.size() < OPTION_COUNT - 1) {
                    distractors.add(w);
                }
            }
            if (distractors.size() < OPTION_COUNT - 1) {
                continue;
            }

            int answerIndex = qIndex % OPTION_COUNT;
            List<String> options = new ArrayList<>(Arrays.asList("", "", "", ""));
            options.set(answerIndex, answer);
            int di = 0;
            for (int i = 0; i < OPTION_COUNT; i++) {
                if (i != answerIndex) {
                    options.set(i, distractors.get(di++));
                }
            }

            StringBuilder cloze = new StringBuilder();
            for (int i = 0; i < words.length; i++) {
                if (i > 0) {
                    cloze.append(" ");
                }
                cloze.append(i == targetIdx ? "_____" : words[i]);
            }
            String explanation = answer + " — " + sentence;

            questions.add(new GeneratedQuizQuestion(
                    cloze.toString(), options, answerIndex, explanation));
            qIndex++;
        }
        return questions;
    }

    private int pickLongestWord(String[] words) {
        int best = -1;
        int bestLen = 0;
        for (int i = 0; i < words.length; i++) {
            int len = stripPunct(words[i]).length();
            if (len > bestLen && len >= 4) {
                bestLen = len;
                best = i;
            }
        }
        return best;
    }

    private String stripPunct(String word) {
        if (word == null) {
            return "";
        }
        return word.replaceAll("[^\\p{L}\\p{N}]", "");
    }
}
