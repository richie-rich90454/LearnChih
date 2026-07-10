package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.PdfHighlightDtos.CreatePdfHighlightRequest;
import com.richardjiang880.lernchih.dto.PdfHighlightDtos.PdfHighlightResponse;
import com.richardjiang880.lernchih.dto.PdfHighlightDtos.UpdatePdfHighlightRequest;
import com.richardjiang880.lernchih.model.PdfHighlight;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.PdfHighlightRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for PDF highlights (F12). Highlights are scoped per user per
 * resource. The list endpoint accepts a {@code resourceId} query parameter.
 */
@RestController
@RequestMapping("/api/pdf-highlights")
public class PdfHighlightController {

    private final PdfHighlightRepository highlightRepository;
    private final UserRepository userRepository;

    public PdfHighlightController(PdfHighlightRepository highlightRepository,
                                  UserRepository userRepository) {
        this.highlightRepository = highlightRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PdfHighlightResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("resourceId") Long resourceId) {
        User user = getUserFromDetails(userDetails);
        List<PdfHighlight> highlights =
                highlightRepository.findByUserIdAndResourceIdOrderByPageNumberAsc(user.getId(), resourceId);
        return ResponseEntity.ok(highlights.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<PdfHighlightResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreatePdfHighlightRequest request) {
        User user = getUserFromDetails(userDetails);
        PdfHighlight highlight = PdfHighlight.builder()
                .userId(user.getId())
                .resourceId(request.resourceId())
                .pageNumber(request.pageNumber())
                .highlightedText(request.highlightedText() == null ? "" : request.highlightedText())
                .color(request.color())
                .note(request.note())
                .build();
        highlight = highlightRepository.save(highlight);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(highlight));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PdfHighlightResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdatePdfHighlightRequest request) {
        User user = getUserFromDetails(userDetails);
        PdfHighlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Highlight not found"));
        if (!highlight.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.color() != null) {
            highlight.setColor(request.color());
        }
        if (request.note() != null) {
            highlight.setNote(request.note());
        }
        highlight = highlightRepository.save(highlight);
        return ResponseEntity.ok(toResponse(highlight));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        PdfHighlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Highlight not found"));
        if (!highlight.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        highlightRepository.delete(highlight);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private PdfHighlightResponse toResponse(PdfHighlight h) {
        return new PdfHighlightResponse(
                h.getId(),
                h.getUserId(),
                h.getResourceId(),
                h.getPageNumber(),
                h.getHighlightedText(),
                h.getColor(),
                h.getNote(),
                h.getCreatedAt()
        );
    }
}
