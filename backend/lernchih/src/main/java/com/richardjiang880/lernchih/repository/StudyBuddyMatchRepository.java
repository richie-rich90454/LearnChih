package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.StudyBuddyMatch;
import com.richardjiang880.lernchih.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyBuddyMatchRepository extends JpaRepository<StudyBuddyMatch, Long> {

    Optional<StudyBuddyMatch> findByUserIdAndBuddyId(Long userId, Long buddyId);

    List<StudyBuddyMatch> findByUserIdAndStatusOrderByMatchScoreDesc(Long userId, MatchStatus status);

    List<StudyBuddyMatch> findByUserId(Long userId);
}
