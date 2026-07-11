package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.DueTodayDtos.DueTodayResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.DueTodayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for the unified due-today review queue (F24). Exposes a
 * single endpoint that aggregates due flashcards, due resource reviews,
 * and unattempted quizzes for the authenticated user.
 */
@RestController
@RequestMapping("/api/due-today")
public class DueTodayController {

    private final DueTodayService dueTodayService;
    private final UserRepository userRepository;

    public DueTodayController(DueTodayService dueTodayService,
                              UserRepository userRepository) {
        this.dueTodayService = dueTodayService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<DueTodayResponse> getDueToday(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(dueTodayService.getDueToday(user.getId()));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
