package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.AnnotationDtos.AnnotationResponse;
import com.richardjiang880.lernchih.dto.AnnotationDtos.CreateAnnotationRequest;
import com.richardjiang880.lernchih.dto.AnnotationDtos.UpdateAnnotationRequest;
import com.richardjiang880.lernchih.model.Annotation;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.AnnotationRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for inline resource annotations (F13). Annotations are scoped
 * per user per resource. The list endpoint accepts a {@code resourceId} query.
 */
@RestController
@RequestMapping("/api/annotations")
public class AnnotationController {

    private final AnnotationRepository annotationRepository;
    private final UserRepository userRepository;

    public AnnotationController(AnnotationRepository annotationRepository,
                                UserRepository userRepository) {
        this.annotationRepository = annotationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AnnotationResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("resourceId") Long resourceId) {
        User user = getUserFromDetails(userDetails);
        List<Annotation> annotations =
                annotationRepository.findByUserIdAndResourceIdOrderByCreatedAtAsc(user.getId(), resourceId);
        return ResponseEntity.ok(annotations.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<AnnotationResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateAnnotationRequest request) {
        User user = getUserFromDetails(userDetails);
        Annotation annotation = Annotation.builder()
                .userId(user.getId())
                .resourceId(request.resourceId())
                .quote(request.quote() == null ? "" : request.quote())
                .content(request.content() == null ? "" : request.content())
                .startOffset(request.startOffset())
                .endOffset(request.endOffset())
                .build();
        annotation = annotationRepository.save(annotation);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(annotation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnotationResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateAnnotationRequest request) {
        User user = getUserFromDetails(userDetails);
        Annotation annotation = annotationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Annotation not found"));
        if (!annotation.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.content() != null) {
            annotation.setContent(request.content());
        }
        annotation = annotationRepository.save(annotation);
        return ResponseEntity.ok(toResponse(annotation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        Annotation annotation = annotationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Annotation not found"));
        if (!annotation.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        annotationRepository.delete(annotation);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private AnnotationResponse toResponse(Annotation a) {
        return new AnnotationResponse(
                a.getId(),
                a.getUserId(),
                a.getResourceId(),
                a.getQuote(),
                a.getContent(),
                a.getStartOffset(),
                a.getEndOffset(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
