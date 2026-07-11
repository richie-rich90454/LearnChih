package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ScreenShareSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenShareSessionRepository extends JpaRepository<ScreenShareSession, Long> {

    List<ScreenShareSession> findByStudyGroupIdOrderByStartedAtDesc(Long studyGroupId);
}
