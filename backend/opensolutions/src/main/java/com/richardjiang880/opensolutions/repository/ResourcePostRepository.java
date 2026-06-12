package com.richardjiang880.opensolutions.repository;

import com.richardjiang880.opensolutions.model.ResourcePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourcePostRepository extends JpaRepository<ResourcePost, Long> {

    Page<ResourcePost> findByThreadIdOrderByCreatedAtAsc(Long threadId, Pageable pageable);
}
