package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.RichContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RichContentRepository extends JpaRepository<RichContent, Long> {

    Optional<RichContent> findByPostIdAndPostType(Long postId, PostType postType);
}
