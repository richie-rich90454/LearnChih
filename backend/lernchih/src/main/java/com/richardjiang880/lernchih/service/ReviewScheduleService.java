package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ReviewScheduleDtos.ReviewScheduleResponse;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ReviewSchedule;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.ReviewScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Spaced-repetition scheduling using the SM-2 algorithm.
 *
 * <p>SM-2 reference (SuperMemo): given a recall quality q in [0,5],
 *   - if q &lt; 3 the item is "forgotten": repetitions reset to 0 and the
 *     interval restarts at 1 day.
 *   - otherwise the interval grows (1, 6, then interval * easeFactor) and
 *     repetitions increment.
 *   - the ease factor is adjusted by q and floored at 1.3.
 *   - the next due date is today + interval days.
 */
@Service
public class ReviewScheduleService {

    private static final double MIN_EASE = 1.3;
    private static final double DEFAULT_EASE = 2.5;
    private static final int DEFAULT_INTERVAL = 1;

    private final ReviewScheduleRepository reviewScheduleRepository;
    private final ResourceRepository resourceRepository;

    public ReviewScheduleService(ReviewScheduleRepository reviewScheduleRepository,
                                 ResourceRepository resourceRepository) {
        this.reviewScheduleRepository = reviewScheduleRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public ReviewScheduleResponse schedule(Long userId, Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        // Re-scheduling an existing item resets its progress so the user can
        // restart a review cycle.
        ReviewSchedule schedule = reviewScheduleRepository
                .findByUserIdAndResourceId(userId, resourceId)
                .orElseGet(() -> ReviewSchedule.builder()
                        .userId(userId)
                        .resource(resource)
                        .build());

        schedule.setIntervalDays(DEFAULT_INTERVAL);
        schedule.setEaseFactor(DEFAULT_EASE);
        schedule.setReviewCount(0);
        schedule.setDueDate(LocalDate.now().plusDays(DEFAULT_INTERVAL));
        schedule = reviewScheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    @Transactional(readOnly = true)
    public List<ReviewScheduleResponse> getDueReviews(Long userId) {
        return reviewScheduleRepository
                .findByUserIdAndDueDateLessThanEqualOrderByDueDateAsc(userId, LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewScheduleResponse> getUpcomingReviews(Long userId) {
        return reviewScheduleRepository.findByUserIdOrderByDueDateAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewScheduleResponse completeReview(Long scheduleId, int quality) {
        ReviewSchedule schedule = reviewScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Review schedule not found"));

        int q = Math.max(0, Math.min(5, quality));
        int repetitions = schedule.getReviewCount();
        double ease = schedule.getEaseFactor() == null ? DEFAULT_EASE : schedule.getEaseFactor();
        int interval;

        if (q < 3) {
            repetitions = 0;
            interval = DEFAULT_INTERVAL;
        } else {
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(schedule.getIntervalDays() * ease);
            }
            repetitions += 1;
        }

        double newEase = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (newEase < MIN_EASE) {
            newEase = MIN_EASE;
        }

        schedule.setEaseFactor(Math.round(newEase * 100.0) / 100.0);
        schedule.setIntervalDays(Math.max(DEFAULT_INTERVAL, interval));
        schedule.setReviewCount(repetitions);
        schedule.setDueDate(LocalDate.now().plusDays(schedule.getIntervalDays()));
        schedule = reviewScheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    private ReviewScheduleResponse toResponse(ReviewSchedule s) {
        return new ReviewScheduleResponse(
                s.getId(),
                s.getUserId(),
                s.getResource() != null ? s.getResource().getId() : null,
                s.getResource() != null ? s.getResource().getTitle() : null,
                s.getDueDate(),
                s.getIntervalDays(),
                s.getEaseFactor(),
                s.getReviewCount(),
                s.getCreatedAt()
        );
    }
}
