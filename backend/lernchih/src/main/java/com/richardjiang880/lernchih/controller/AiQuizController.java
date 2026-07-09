package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.AiQuizDtos.GenerateResponse;
import com.richardjiang880.lernchih.dto.AiQuizDtos.SaveRequest;
import com.richardjiang880.lernchih.dto.AiQuizDtos.SaveResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.AiQuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI quiz generation (F5). Exposes generate + save
 * endpoints scoped to a resource so authenticated users can create a
 * multiple-choice quiz from the resource's content and persist it.
 */
@RestController
@RequestMapping("/api/resources/{resourceId}/ai-quiz")
public class AiQuizController {

    private final AiQuizService aiQuizService;
    private final UserRepository userRepository;

    public AiQuizController(AiQuizService aiQuizService, UserRepository userRepository) {
        this.aiQuizService = aiQuizService;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long resourceId) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(aiQuizService.generate(user.getId(), resourceId));
    }

    @PostMapping("/save")
    public ResponseEntity<SaveResponse> save(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long resourceId,
            @RequestBody SaveRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(aiQuizService.save(user.getId(), resourceId, request));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
