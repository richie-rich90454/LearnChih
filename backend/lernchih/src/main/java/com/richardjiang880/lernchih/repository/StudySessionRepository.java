package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdAndStartTimeAfterOrderByStartTimeAsc(Long userId, LocalDateTime after);

    List<StudySession> findByUserIdAndStartTimeAfterAndTypeOrderByStartTimeAsc(
            Long userId, LocalDateTime after, com.richardjiang880.lernchih.model.StudySessionType type);

    List<StudySession> findByUserIdOrderByStartTimeDesc(Long userId);
}
