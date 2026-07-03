package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.RichContentDtos;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.service.RichContentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RichContentControllerTest {

    @Mock
    private RichContentService richContentService;

    private RichContentController controller;

    @BeforeEach
    void setUp() {
        controller = new RichContentController(richContentService);
    }

    @Test
    void saveContentReturnsResponse() {
        RichContentDtos.RichContentRequest request = new RichContentDtos.RichContentRequest("md", "html");
        RichContentDtos.RichContentResponse response = new RichContentDtos.RichContentResponse(1L, 10L, "RESOURCE", "md", "html", LocalDateTime.now());
        when(richContentService.saveContent(10L, PostType.RESOURCE, request)).thenReturn(response);

        ResponseEntity<RichContentDtos.RichContentResponse> result = controller.saveContent(10L, PostType.RESOURCE, request);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void getContentReturnsResponse() {
        RichContentDtos.RichContentResponse response = new RichContentDtos.RichContentResponse(1L, 10L, "RESOURCE", "md", "html", LocalDateTime.now());
        when(richContentService.getContent(10L, PostType.RESOURCE)).thenReturn(response);

        ResponseEntity<RichContentDtos.RichContentResponse> result = controller.getContent(10L, PostType.RESOURCE);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void listAttachmentsReturnsList() {
        RichContentDtos.AttachmentResponse attachment = new RichContentDtos.AttachmentResponse(1L, 10L, "RESOURCE", "file.pdf", "/files/file.pdf", 1024L, "application/pdf", LocalDateTime.now());
        when(richContentService.listAttachments(10L, PostType.RESOURCE)).thenReturn(List.of(attachment));

        ResponseEntity<List<RichContentDtos.AttachmentResponse>> result = controller.listAttachments(10L, PostType.RESOURCE);

        assertThat(result.getBody()).containsExactly(attachment);
    }
}
