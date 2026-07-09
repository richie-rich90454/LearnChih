package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.PortfolioItemDtos.CreatePortfolioItemRequest;
import com.richardjiang880.lernchih.dto.PortfolioItemDtos.PortfolioItemResponse;
import com.richardjiang880.lernchih.dto.PortfolioItemDtos.UpdatePortfolioItemRequest;
import com.richardjiang880.lernchih.model.PortfolioItem;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.PortfolioItemRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user profile portfolios (F35).
 *
 * <p>Public read access: {@code GET /api/users/{userId}/portfolio}.
 * Owner-only management: {@code /api/portfolio} (create / list own / update /
 * delete), scoped to the authenticated user.</p>
 */
@RestController
public class PortfolioController {

    private final PortfolioItemRepository portfolioRepository;
    private final UserRepository userRepository;

    public PortfolioController(PortfolioItemRepository portfolioRepository,
                               UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }

    /**
     * Public list of a user's portfolio items, ordered by curation.
     */
    @GetMapping("/api/users/{userId}/portfolio")
    public ResponseEntity<List<PortfolioItemResponse>> listPublic(
            @PathVariable Long userId) {
        List<PortfolioItemResponse> body = portfolioRepository
                .findByUserIdOrderByDisplayOrderAscCreatedAtAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(body);
    }

    /**
     * List the current user's own portfolio (owner management view).
     */
    @GetMapping("/api/portfolio")
    public ResponseEntity<List<PortfolioItemResponse>> listOwn(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<PortfolioItemResponse> body = portfolioRepository
                .findByUserIdOrderByDisplayOrderAscCreatedAtAsc(me.getId())
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(body);
    }

    /**
     * Create a new portfolio item for the current user.
     */
    @PostMapping("/api/portfolio")
    public ResponseEntity<PortfolioItemResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePortfolioItemRequest request) {
        User me = getUserFromDetails(userDetails);
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Portfolio item title cannot be empty");
        }
        PortfolioItem item = PortfolioItem.builder()
                .userId(me.getId())
                .title(request.title())
                .description(request.description())
                .url(request.url())
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
        item = portfolioRepository.save(item);
        return ResponseEntity.ok(toResponse(item));
    }

    /**
     * Update a portfolio item. Only the owner may modify it.
     */
    @PutMapping("/api/portfolio/{id}")
    public ResponseEntity<PortfolioItemResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdatePortfolioItemRequest request) {
        User me = getUserFromDetails(userDetails);
        PortfolioItem item = portfolioRepository.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Portfolio item not found"));
        if (request.title() != null && !request.title().isBlank()) {
            item.setTitle(request.title());
        }
        item.setDescription(request.description());
        item.setUrl(request.url());
        if (request.displayOrder() != null) {
            item.setDisplayOrder(request.displayOrder());
        }
        item = portfolioRepository.save(item);
        return ResponseEntity.ok(toResponse(item));
    }

    /**
     * Delete a portfolio item. Only the owner may delete it.
     */
    @DeleteMapping("/api/portfolio/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        PortfolioItem item = portfolioRepository.findByIdAndUserId(id, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Portfolio item not found"));
        portfolioRepository.delete(item);
        return ResponseEntity.noContent().build();
    }

    private PortfolioItemResponse toResponse(PortfolioItem i) {
        return new PortfolioItemResponse(
                i.getId(),
                i.getUserId(),
                i.getTitle(),
                i.getDescription(),
                i.getUrl(),
                i.getDisplayOrder(),
                i.getCreatedAt()
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
