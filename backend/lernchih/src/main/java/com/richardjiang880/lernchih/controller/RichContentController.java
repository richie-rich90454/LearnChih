package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.RichContentDtos;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.service.RichContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for rich content and attachments (Task 8.1).
 *
 * Posts are polymorphic; the optional {@code postType} query parameter
 * (RESOURCE | CHANNEL) disambiguates which posts table is referenced and
 * defaults to RESOURCE.
 */
@RestController
@RequestMapping("/api/posts")
public class RichContentController {

    private final RichContentService richContentService;

    public RichContentController(RichContentService richContentService) {
        this.richContentService = richContentService;
    }

    @PostMapping("/{postId}/content")
    public ResponseEntity<RichContentDtos.RichContentResponse> saveContent(
            @PathVariable Long postId,
            @RequestParam(name = "postType", defaultValue = "RESOURCE") PostType postType,
            @RequestBody RichContentDtos.RichContentRequest request) {
        return ResponseEntity.ok(richContentService.saveContent(postId, postType, request));
    }

    @GetMapping("/{postId}/content")
    public ResponseEntity<RichContentDtos.RichContentResponse> getContent(
            @PathVariable Long postId,
            @RequestParam(name = "postType", defaultValue = "RESOURCE") PostType postType) {
        return ResponseEntity.ok(richContentService.getContent(postId, postType));
    }

    @GetMapping("/{postId}/attachments")
    public ResponseEntity<List<RichContentDtos.AttachmentResponse>> listAttachments(
            @PathVariable Long postId,
            @RequestParam(name = "postType", defaultValue = "RESOURCE") PostType postType) {
        return ResponseEntity.ok(richContentService.listAttachments(postId, postType));
    }
}
