package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.RichContentDtos;
import com.richardjiang880.lernchih.model.Attachment;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.RichContent;
import com.richardjiang880.lernchih.repository.AttachmentRepository;
import com.richardjiang880.lernchih.repository.RichContentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RichContentServiceTest {

    @Mock
    private RichContentRepository richContentRepository;

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private ContentSanitizer contentSanitizer;

    @InjectMocks
    private RichContentService richContentService;

    @Test
    void saveContentCreatesNewContentWhenAbsent() {
        RichContentDtos.RichContentRequest request = new RichContentDtos.RichContentRequest("md", "html");
        when(contentSanitizer.sanitize("html")).thenReturn("safe-html");
        when(richContentRepository.findByPostIdAndPostType(1L, PostType.RESOURCE)).thenReturn(Optional.empty());
        when(richContentRepository.save(any(RichContent.class))).thenAnswer(inv -> {
            RichContent rc = inv.getArgument(0);
            rc.setId(100L);
            return rc;
        });

        RichContentDtos.RichContentResponse response = richContentService.saveContent(1L, PostType.RESOURCE, request);

        assertThat(response.contentHtml()).isEqualTo("safe-html");
        assertThat(response.contentMarkdown()).isEqualTo("md");
    }

    @Test
    void saveContentUpdatesExistingContent() {
        RichContent existing = RichContent.builder().id(100L).postId(1L).postType(PostType.RESOURCE).build();
        RichContentDtos.RichContentRequest request = new RichContentDtos.RichContentRequest("new-md", "new-html");
        when(contentSanitizer.sanitize("new-html")).thenReturn("safe-new-html");
        when(richContentRepository.findByPostIdAndPostType(1L, PostType.RESOURCE)).thenReturn(Optional.of(existing));
        when(richContentRepository.save(any(RichContent.class))).thenAnswer(inv -> inv.getArgument(0));

        RichContentDtos.RichContentResponse response = richContentService.saveContent(1L, PostType.RESOURCE, request);

        assertThat(response.contentHtml()).isEqualTo("safe-new-html");
    }

    @Test
    void getContentReturnsResponse() {
        RichContent existing = RichContent.builder().id(100L).postId(1L).postType(PostType.RESOURCE).contentMarkdown("md").contentHtml("html").build();
        when(richContentRepository.findByPostIdAndPostType(1L, PostType.RESOURCE)).thenReturn(Optional.of(existing));

        RichContentDtos.RichContentResponse response = richContentService.getContent(1L, PostType.RESOURCE);

        assertThat(response).isNotNull();
        assertThat(response.contentMarkdown()).isEqualTo("md");
    }

    @Test
    void getContentReturnsNullWhenAbsent() {
        when(richContentRepository.findByPostIdAndPostType(1L, PostType.RESOURCE)).thenReturn(Optional.empty());

        assertThat(richContentService.getContent(1L, PostType.RESOURCE)).isNull();
    }

    @Test
    void listAttachmentsReturnsMappedResponses() {
        Attachment a = Attachment.builder().id(1L).postId(1L).postType(PostType.RESOURCE).filename("f.txt").filePath("/path").fileSize(12L).mimeType("text/plain").build();
        when(attachmentRepository.findByPostIdAndPostTypeOrderByCreatedAtAsc(1L, PostType.RESOURCE)).thenReturn(List.of(a));

        List<RichContentDtos.AttachmentResponse> responses = richContentService.listAttachments(1L, PostType.RESOURCE);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).filename()).isEqualTo("f.txt");
    }

    @Test
    void recordAttachmentSavesAndReturnsResponse() {
        Attachment a = Attachment.builder().id(1L).postId(1L).postType(PostType.RESOURCE).filename("f.txt").filePath("/path").fileSize(12L).mimeType("text/plain").build();
        when(attachmentRepository.save(any(Attachment.class))).thenReturn(a);

        RichContentDtos.AttachmentResponse response = richContentService.recordAttachment(1L, PostType.RESOURCE, "f.txt", "/path", 12L, "text/plain");

        assertThat(response.filename()).isEqualTo("f.txt");
    }
}
