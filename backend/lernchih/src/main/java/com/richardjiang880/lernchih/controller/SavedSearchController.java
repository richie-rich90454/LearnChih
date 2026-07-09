package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.SavedSearchDtos.CreateSavedSearchRequest;
import com.richardjiang880.lernchih.dto.SavedSearchDtos.SavedSearchResponse;
import com.richardjiang880.lernchih.dto.SavedSearchDtos.UpdateSavedSearchRequest;
import com.richardjiang880.lernchih.model.SavedSearch;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.SavedSearchRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for saved searches with email alerts (F34).
 */
@RestController
@RequestMapping("/api/saved-searches")
public class SavedSearchController {

    private final SavedSearchRepository savedSearchRepository;
    private final UserRepository userRepository;

    public SavedSearchController(SavedSearchRepository savedSearchRepository,
                                 UserRepository userRepository) {
        this.savedSearchRepository = savedSearchRepository;
        this.userRepository = userRepository;
    }

    /**
     * List the current user's saved searches, newest first.
     */
    @GetMapping
    public ResponseEntity<List<SavedSearchResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<SavedSearchResponse> body = savedSearchRepository
                .findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(body);
    }

    /**
     * Create a new saved search for the current user.
     */
    @PostMapping
    public ResponseEntity<SavedSearchResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateSavedSearchRequest request) {
        User me = getUserFromDetails(userDetails);
        if (request.query() == null || request.query().isBlank()) {
            throw new IllegalArgumentException("Saved search query cannot be empty");
        }
        String name = (request.name() == null || request.name().isBlank())
                ? request.query()
                : request.name();
        SavedSearch saved = SavedSearch.builder()
                .userId(me.getId())
                .name(name)
                .query(request.query())
                .emailAlerts(Boolean.TRUE.equals(request.emailAlerts()))
                .build();
        saved = savedSearchRepository.save(saved);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Update a saved search's display name and/or email-alert toggle.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SavedSearchResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSavedSearchRequest request) {
        User me = getUserFromDetails(userDetails);
        SavedSearch saved = savedSearchRepository.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Saved search not found"));
        if (request.name() != null && !request.name().isBlank()) {
            saved.setName(request.name());
        }
        if (request.emailAlerts() != null) {
            saved.setEmailAlerts(request.emailAlerts());
        }
        saved = savedSearchRepository.save(saved);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Delete a saved search. Only the owner may delete it.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        SavedSearch saved = savedSearchRepository.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Saved search not found"));
        savedSearchRepository.delete(saved);
        return ResponseEntity.noContent().build();
    }

    private SavedSearchResponse toResponse(SavedSearch s) {
        return new SavedSearchResponse(
                s.getId(),
                s.getUserId(),
                s.getName(),
                s.getQuery(),
                s.isEmailAlerts(),
                s.getLastNotifiedAt(),
                s.getCreatedAt()
        );
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
