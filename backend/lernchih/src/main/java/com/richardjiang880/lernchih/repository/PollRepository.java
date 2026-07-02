package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Poll;
import com.richardjiang880.lernchih.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {

    Optional<Poll> findByPostIdAndPostType(Long postId, PostType postType);
}
