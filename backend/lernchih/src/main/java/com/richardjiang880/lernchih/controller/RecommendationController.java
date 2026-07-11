package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.RecommendationDtos.RecommendationItem;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for content-based resource recommendations (F23). Exposes the
 * "Recommended for you" feed and an endpoint to record a resource view so the
 * underlying affinity profile stays fresh.
 */
@RestController
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public RecommendationController(RecommendationService recommendationService,
                                    ResourceRepository resourceRepository,
                                    UserRepository userRepository) {
        this.recommendationService = recommendationService;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/api/resources/recommendations")
    public ResponseEntity<List<RecommendationItem>> recommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(recommendationService.recommend(user.getId()));
    }

    @PostMapping("/api/resources/{id}/interact")
    public ResponseEntity<Void> recordInteraction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        resourceRepository.findById(id).ifPresent(
                r -> recommendationService.recordView(user.getId(), r));
        return ResponseEntity.ok().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
