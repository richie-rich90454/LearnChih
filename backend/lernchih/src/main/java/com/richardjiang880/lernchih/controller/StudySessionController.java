package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.StudySessionDtos.LogSessionRequest;
import com.richardjiang880.lernchih.dto.StudySessionDtos.StudySessionResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.StudySessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Pomodoro study session logging (F7).
 */
@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;
    private final UserRepository userRepository;

    public StudySessionController(StudySessionService studySessionService,
                                  UserRepository userRepository) {
        this.studySessionService = studySessionService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<StudySessionResponse> log(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody LogSessionRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(studySessionService.logSession(user.getId(), request));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<StudySessionResponse>> weekly(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(studySessionService.getWeeklySessions(user.getId()));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
