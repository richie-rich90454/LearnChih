package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PostTag;
import com.richardjiang880.lernchih.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostTagRepository extends JpaRepository<PostTag, Long> {

    List<PostTag> findByPostIdAndPostType(Long postId, PostType postType);

    Optional<PostTag> findByPostIdAndPostTypeAndTagId(Long postId, PostType postType, Long tagId);

    boolean existsByPostIdAndPostTypeAndTagId(Long postId, PostType postType, Long tagId);

    void deleteByPostIdAndPostTypeAndTagId(Long postId, PostType postType, Long tagId);
}
