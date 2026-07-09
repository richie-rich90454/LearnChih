package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.MatchDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for study-buddy matching (F39).
 *
 * <p>Endpoints:
 * <ul>
 *   <li>GET    /api/matching/suggestions — list ranked buddy suggestions</li>
 *   <li>POST   /api/matching/{matchId}/dismiss — hide a suggestion</li>
 *   <li>POST   /api/matching/connected/{buddyId} — mark as connected (called
 *       after the frontend successfully sends a friend request via F38)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/matching")
public class MatchController {

    private final MatchingService matchingService;
    private final UserRepository userRepository;

    public MatchController(MatchingService matchingService,
                           UserRepository userRepository) {
        this.matchingService = matchingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<MatchDtos.BuddySuggestion>> suggestions(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(matchingService.suggestBuddies(user));
    }

    @PostMapping("/{matchId}/dismiss")
    public ResponseEntity<Void> dismiss(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long matchId) {
        User user = getUserFromDetails(userDetails);
        matchingService.dismiss(user, matchId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/connected/{buddyId}")
    public ResponseEntity<Void> markConnected(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long buddyId) {
        User user = getUserFromDetails(userDetails);
        matchingService.markConnected(user, buddyId);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in database"));
    }
}
