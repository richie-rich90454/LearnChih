package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.AiFlashcardDtos.GenerateResponse;
import com.richardjiang880.lernchih.dto.AiFlashcardDtos.SaveRequest;
import com.richardjiang880.lernchih.dto.AiFlashcardDtos.SaveResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.AiFlashcardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI flashcard generation (F4). Exposes generate + save
 * endpoints scoped to a resource so authenticated users can create a deck of
 * cloze-deletion flashcards from the resource's content and persist it.
 */
@RestController
@RequestMapping("/api/resources/{resourceId}/ai-flashcards")
public class AiFlashcardController {

    private final AiFlashcardService aiFlashcardService;
    private final UserRepository userRepository;

    public AiFlashcardController(AiFlashcardService aiFlashcardService,
                                 UserRepository userRepository) {
        this.aiFlashcardService = aiFlashcardService;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long resourceId) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(aiFlashcardService.generate(user.getId(), resourceId));
    }

    @PostMapping("/save")
    public ResponseEntity<SaveResponse> save(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long resourceId,
            @RequestBody SaveRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(aiFlashcardService.save(user.getId(), resourceId, request));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
