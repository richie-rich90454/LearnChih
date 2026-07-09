package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.StudySessionDtos.LogSessionRequest;
import com.richardjiang880.lernchih.dto.StudySessionDtos.StudySessionResponse;
import com.richardjiang880.lernchih.model.StudySession;
import com.richardjiang880.lernchih.model.StudySessionType;
import com.richardjiang880.lernchih.repository.StudySessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Business logic for study session logging (F7). A session is created when a
 * Pomodoro focus or break block completes. The weekly view returns the last
 * seven days of sessions for the stats / weekly report (F8).
 */
@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;

    public StudySessionService(StudySessionRepository studySessionRepository) {
        this.studySessionRepository = studySessionRepository;
    }

    @Transactional
    public StudySessionResponse logSession(Long userId, LogSessionRequest request) {
        StudySessionType type = parseType(request.type());
        LocalDateTime start = request.startTime() != null ? request.startTime() : LocalDateTime.now();
        LocalDateTime end = request.endTime() != null ? request.endTime() : LocalDateTime.now();
        int duration = request.durationMinutes() != null
                ? request.durationMinutes()
                : Math.max(0, (int) java.time.Duration.between(start, end).toMinutes());

        StudySession session = StudySession.builder()
                .userId(userId)
                .startTime(start)
                .endTime(end)
                .durationMinutes(duration)
                .type(type)
                .resourceId(request.resourceId())
                .build();
        session = studySessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public List<StudySessionResponse> getWeeklySessions(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        return studySessionRepository.findByUserIdAndStartTimeAfterOrderByStartTimeAsc(userId, since)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StudySessionType parseType(String type) {
        if (type == null || type.isBlank()) {
            return StudySessionType.FOCUS;
        }
        try {
            return StudySessionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return StudySessionType.FOCUS;
        }
    }

    private StudySessionResponse toResponse(StudySession s) {
        return new StudySessionResponse(
                s.getId(),
                s.getUserId(),
                s.getStartTime(),
                s.getEndTime(),
                s.getDurationMinutes(),
                s.getType().name(),
                s.getResourceId(),
                s.getCreatedAt()
        );
    }
}
