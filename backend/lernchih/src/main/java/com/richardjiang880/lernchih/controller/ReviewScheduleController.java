package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ReviewScheduleDtos.CompleteRequest;
import com.richardjiang880.lernchih.dto.ReviewScheduleDtos.ReviewScheduleResponse;
import com.richardjiang880.lernchih.dto.ReviewScheduleDtos.ScheduleRequest;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ReviewScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the spaced-repetition review scheduler (F1).
 */
@RestController
@RequestMapping("/api/review")
public class ReviewScheduleController {

    private final ReviewScheduleService reviewScheduleService;
    private final UserRepository userRepository;

    public ReviewScheduleController(ReviewScheduleService reviewScheduleService,
                                    UserRepository userRepository) {
        this.reviewScheduleService = reviewScheduleService;
        this.userRepository = userRepository;
    }

    @PostMapping("/schedule")
    public ResponseEntity<ReviewScheduleResponse> schedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ScheduleRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(reviewScheduleService.schedule(user.getId(), request.resourceId()));
    }

    @GetMapping("/due")
    public ResponseEntity<List<ReviewScheduleResponse>> getDue(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(reviewScheduleService.getDueReviews(user.getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ReviewScheduleResponse>> getUpcoming(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(reviewScheduleService.getUpcomingReviews(user.getId()));
    }

    @PostMapping("/complete/{id}")
    public ResponseEntity<ReviewScheduleResponse> complete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) CompleteRequest request) {
        User user = getUserFromDetails(userDetails);
        int quality = (request == null || request.quality() == null) ? 4 : request.quality();
        return ResponseEntity.ok(reviewScheduleService.completeReview(id, quality));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
