package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ContentVersion;
import com.richardjiang880.lernchih.model.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentVersionRepository extends JpaRepository<ContentVersion, Long> {

    Page<ContentVersion> findByPostIdAndPostTypeOrderByVersionNumberDesc(Long postId, PostType postType, Pageable pageable);

    long countByPostIdAndPostType(Long postId, PostType postType);
}
