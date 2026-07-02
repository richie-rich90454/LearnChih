package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {

    Optional<PollVote> findByUserIdAndPollId(Long userId, Long pollId);

    boolean existsByUserIdAndPollId(Long userId, Long pollId);
}
