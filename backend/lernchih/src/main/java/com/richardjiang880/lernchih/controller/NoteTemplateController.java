package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.NoteTemplateDtos.CreateNoteTemplateRequest;
import com.richardjiang880.lernchih.dto.NoteTemplateDtos.NoteTemplateResponse;
import com.richardjiang880.lernchih.model.NoteTemplate;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NoteTemplateRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for note templates (F11). The list endpoint returns system
 * templates (userId null) alongside the user's own templates. Only the owner
 * can delete a user template; system templates cannot be deleted.
 */
@RestController
@RequestMapping("/api/note-templates")
public class NoteTemplateController {

    private final NoteTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public NoteTemplateController(NoteTemplateRepository templateRepository,
                                  UserRepository userRepository) {
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NoteTemplateResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        List<NoteTemplate> templates =
                templateRepository.findByUserIdOrUserIdIsNullOrderByNameAsc(user.getId());
        return ResponseEntity.ok(templates.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<NoteTemplateResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateNoteTemplateRequest request) {
        User user = getUserFromDetails(userDetails);
        NoteTemplate template = NoteTemplate.builder()
                .userId(user.getId())
                .name(request.name() == null || request.name().isBlank() ? "Template" : request.name())
                .content(request.content() == null ? "" : request.content())
                .category(request.category())
                .build();
        template = templateRepository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        NoteTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        if (template.getUserId() == null || !template.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        templateRepository.delete(template);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private NoteTemplateResponse toResponse(NoteTemplate t) {
        return new NoteTemplateResponse(
                t.getId(),
                t.getUserId(),
                t.getName(),
                t.getContent(),
                t.getCategory(),
                t.getCreatedAt()
        );
    }
}
