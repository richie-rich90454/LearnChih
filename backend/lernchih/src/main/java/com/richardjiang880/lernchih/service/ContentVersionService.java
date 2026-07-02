package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ContentVersionDtos;
import com.richardjiang880.lernchih.model.ContentVersion;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ContentVersionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Snapshots rich content for version history. Each save increments the
 * version number for the (post, postType) pair.
 */
@Service
public class ContentVersionService {

    private final ContentVersionRepository contentVersionRepository;
    private final ContentSanitizer contentSanitizer;

    public ContentVersionService(ContentVersionRepository contentVersionRepository,
                                 ContentSanitizer contentSanitizer) {
        this.contentVersionRepository = contentVersionRepository;
        this.contentSanitizer = contentSanitizer;
    }

    @Transactional
    public ContentVersionDtos.ContentVersionResponse saveVersion(Long postId,
                                                                  String postTypeStr,
                                                                  ContentVersionDtos.ContentVersionRequest request,
                                                                  User user) {
        PostType postType = parsePostType(postTypeStr);
        long existing = contentVersionRepository.countByPostIdAndPostType(postId, postType);
        int nextVersion = (int) existing + 1;

        ContentVersion v = ContentVersion.builder()
                .postId(postId)
                .postType(postType)
                .versionNumber(nextVersion)
                .contentMarkdown(request.contentMarkdown())
                .contentHtml(contentSanitizer.sanitize(request.contentHtml()))
                .createdBy(user)
                .build();
        v = contentVersionRepository.save(v);
        return toResponse(v);
    }

    @Transactional(readOnly = true)
    public Page<ContentVersionDtos.ContentVersionResponse> listVersions(Long postId,
                                                                         String postTypeStr,
                                                                         Pageable pageable) {
        PostType postType = parsePostType(postTypeStr);
        return contentVersionRepository
                .findByPostIdAndPostTypeOrderByVersionNumberDesc(postId, postType, pageable)
                .map(this::toResponse);
    }

    private ContentVersionDtos.ContentVersionResponse toResponse(ContentVersion v) {
        return new ContentVersionDtos.ContentVersionResponse(
                v.getId(), v.getPostId(), v.getPostType().name(), v.getVersionNumber(),
                v.getContentMarkdown(), v.getContentHtml(),
                v.getCreatedBy().getId(), v.getCreatedAt());
    }

    private PostType parsePostType(String postType) {
        if (postType == null || postType.isBlank()) {
            return PostType.RESOURCE;
        }
        try {
            return PostType.valueOf(postType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid postType: " + postType);
        }
    }
}
