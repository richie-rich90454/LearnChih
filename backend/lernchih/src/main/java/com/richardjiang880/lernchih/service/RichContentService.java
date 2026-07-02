package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.RichContentDtos;
import com.richardjiang880.lernchih.model.Attachment;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.RichContent;
import com.richardjiang880.lernchih.repository.AttachmentRepository;
import com.richardjiang880.lernchih.repository.RichContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Saves rich markdown + sanitized HTML for a post and lists attachments.
 * The caller is responsible for sanitizing HTML before passing it in; this
 * service re-applies the project sanitizer defensively before persisting.
 */
@Service
public class RichContentService {

    private final RichContentRepository richContentRepository;
    private final AttachmentRepository attachmentRepository;
    private final ContentSanitizer contentSanitizer;

    public RichContentService(RichContentRepository richContentRepository,
                               AttachmentRepository attachmentRepository,
                               ContentSanitizer contentSanitizer) {
        this.richContentRepository = richContentRepository;
        this.attachmentRepository = attachmentRepository;
        this.contentSanitizer = contentSanitizer;
    }

    @Transactional
    public RichContentDtos.RichContentResponse saveContent(Long postId,
                                                            PostType postType,
                                                            RichContentDtos.RichContentRequest request) {
        String safeHtml = contentSanitizer.sanitize(request.contentHtml());
        RichContent rc = richContentRepository
                .findByPostIdAndPostType(postId, postType)
                .orElseGet(() -> RichContent.builder()
                        .postId(postId)
                        .postType(postType)
                        .build());
        rc.setContentMarkdown(request.contentMarkdown());
        rc.setContentHtml(safeHtml);
        rc = richContentRepository.save(rc);
        return toResponse(rc);
    }

    @Transactional(readOnly = true)
    public RichContentDtos.RichContentResponse getContent(Long postId, PostType postType) {
        return richContentRepository.findByPostIdAndPostType(postId, postType)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<RichContentDtos.AttachmentResponse> listAttachments(Long postId, PostType postType) {
        return attachmentRepository
                .findByPostIdAndPostTypeOrderByCreatedAtAsc(postId, postType)
                .stream()
                .map(a -> new RichContentDtos.AttachmentResponse(
                        a.getId(), a.getPostId(), a.getPostType().name(),
                        a.getFilename(), a.getFilePath(), a.getFileSize(),
                        a.getMimeType(), a.getCreatedAt()))
                .toList();
    }

    @Transactional
    public RichContentDtos.AttachmentResponse recordAttachment(Long postId,
                                                               PostType postType,
                                                               String filename,
                                                               String filePath,
                                                               long fileSize,
                                                               String mimeType) {
        Attachment a = Attachment.builder()
                .postId(postId)
                .postType(postType)
                .filename(filename)
                .filePath(filePath)
                .fileSize(fileSize)
                .mimeType(mimeType)
                .build();
        a = attachmentRepository.save(a);
        return new RichContentDtos.AttachmentResponse(
                a.getId(), a.getPostId(), a.getPostType().name(),
                a.getFilename(), a.getFilePath(), a.getFileSize(),
                a.getMimeType(), a.getCreatedAt());
    }

    private RichContentDtos.RichContentResponse toResponse(RichContent rc) {
        return new RichContentDtos.RichContentResponse(
                rc.getId(), rc.getPostId(), rc.getPostType().name(),
                rc.getContentMarkdown(), rc.getContentHtml(), rc.getUpdatedAt());
    }
}
