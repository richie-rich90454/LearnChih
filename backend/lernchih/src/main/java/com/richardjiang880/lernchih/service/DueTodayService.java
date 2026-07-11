package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.DueTodayDtos.DueItem;
import com.richardjiang880.lernchih.dto.DueTodayDtos.DueItemType;
import com.richardjiang880.lernchih.dto.DueTodayDtos.DueTodayResponse;
import com.richardjiang880.lernchih.model.Flashcard;
import com.richardjiang880.lernchih.model.FlashcardDeck;
import com.richardjiang880.lernchih.model.Quiz;
import com.richardjiang880.lernchih.model.ReviewSchedule;
import com.richardjiang880.lernchih.repository.FlashcardDeckRepository;
import com.richardjiang880.lernchih.repository.FlashcardRepository;
import com.richardjiang880.lernchih.repository.QuizRepository;
import com.richardjiang880.lernchih.repository.ReviewScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Unified due-today review queue (F24). Aggregates three sources of
 * study items that are due or pending for the current user:
 * <ol>
 *   <li>Flashcards whose SM-2 {@code next_review} date has arrived.</li>
 *   <li>Resource review schedules entries whose {@code due_date} has arrived.</li>
 *   <li>Quizzes the user has not yet attempted.</li>
 * </ol>
 */
@Service
public class DueTodayService {

    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final QuizRepository quizRepository;

    public DueTodayService(FlashcardDeckRepository flashcardDeckRepository,
                           FlashcardRepository flashcardRepository,
                           ReviewScheduleRepository reviewScheduleRepository,
                           QuizRepository quizRepository) {
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardRepository = flashcardRepository;
        this.reviewScheduleRepository = reviewScheduleRepository;
        this.quizRepository = quizRepository;
    }

    @Transactional(readOnly = true)
    public DueTodayResponse getDueToday(Long userId) {
        List<DueItem> items = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Due flashcards from user-owned decks
        List<FlashcardDeck> decks = flashcardDeckRepository.findByUserIdOrderByIdDesc(userId);
        if (!decks.isEmpty()) {
            List<Long> deckIds = decks.stream().map(FlashcardDeck::getId).toList();
            List<Flashcard> dueCards = flashcardRepository
                    .findByDeckIdInAndNextReviewLessThanEqual(deckIds, today);
            for (Flashcard card : dueCards) {
                String deckName = decks.stream()
                        .filter(d -> d.getId().equals(card.getDeckId()))
                        .map(FlashcardDeck::getName)
                        .findFirst()
                        .orElse("Flashcard");
                items.add(new DueItem(
                        DueItemType.FLASHCARD,
                        card.getId(),
                        truncate(card.getFront(), 80),
                        deckName,
                        card.getNextReview(),
                        "/flashcards"));
            }
        }

        // 2. Due resource review schedules
        List<ReviewSchedule> dueReviews = reviewScheduleRepository
                .findByUserIdAndDueDateLessThanEqualOrderByDueDateAsc(userId, today);
        for (ReviewSchedule schedule : dueReviews) {
            String title = schedule.getResource() != null
                    ? schedule.getResource().getTitle()
                    : "Resource review";
            items.add(new DueItem(
                    DueItemType.RESOURCE_REVIEW,
                    schedule.getId(),
                    truncate(title, 80),
                    "Review schedule",
                    schedule.getDueDate(),
                    schedule.getResource() != null
                            ? "/resources/" + schedule.getResource().getId()
                            : "/review"));
        }

        // 3. Quizzes not yet attempted
        List<Quiz> unattempted = quizRepository.findUnattemptedByUserId(userId);
        for (Quiz quiz : unattempted) {
            items.add(new DueItem(
                    DueItemType.QUIZ,
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getDescription() != null ? truncate(quiz.getDescription(), 80) : "Quiz",
                    today,
                    "/quizzes"));
        }

        return new DueTodayResponse(items, items.size());
    }

    private String truncate(String text, int max) {
        if (text == null) {
            return "";
        }
        return text.length() <= max ? text : text.substring(0, max - 1) + "\u2026";
    }
}
