package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Attachment;
import com.richardjiang880.lernchih.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByPostIdAndPostTypeOrderByCreatedAtAsc(Long postId, PostType postType);
}
