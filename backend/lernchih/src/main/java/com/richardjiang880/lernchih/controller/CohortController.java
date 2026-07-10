package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CohortDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.CohortService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for cohort-based study groups (F40).
 *
 * <p>Endpoints:
 * <ul>
 *   <li>GET    /api/cohorts — list all cohorts</li>
 *   <li>GET    /api/cohorts/{id} — get a cohort</li>
 *   <li>POST   /api/cohorts — create a cohort (creator becomes LEADER)</li>
 *   <li>POST   /api/cohorts/{id}/join — join as MEMBER</li>
 *   <li>POST   /api/cohorts/{id}/leave — leave the cohort</li>
 *   <li>GET    /api/cohorts/{id}/members — list members</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/cohorts")
public class CohortController {

    private final CohortService cohortService;
    private final UserRepository userRepository;

    public CohortController(CohortService cohortService, UserRepository userRepository) {
        this.cohortService = cohortService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<CohortDtos.CohortResponse>> listAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(cohortService.listAll(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CohortDtos.CohortResponse> getCohort(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(cohortService.getCohort(id, user));
    }

    @PostMapping
    public ResponseEntity<CohortDtos.CohortResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CohortDtos.CreateCohortRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(cohortService.create(request, user));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<CohortDtos.CohortResponse> join(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(cohortService.join(id, user));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leave(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        cohortService.leave(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<CohortDtos.CohortMemberResponse>> members(@PathVariable Long id) {
        return ResponseEntity.ok(cohortService.listMembers(id));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
