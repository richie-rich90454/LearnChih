package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.BadgeDtos.EarnedBadgeResponse;
import com.richardjiang880.lernchih.dto.BadgeDtos.FeaturedBadgeResponse;
import com.richardjiang880.lernchih.dto.BadgeDtos.SetFeaturedBadgesRequest;
import com.richardjiang880.lernchih.model.Badge;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.UserBadge;
import com.richardjiang880.lernchih.repository.BadgeRepository;
import com.richardjiang880.lernchih.repository.UserBadgeRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * REST controller for featured-badge showcase (F37).
 *
 * <p>Public read access: {@code GET /api/users/{userId}/featured-badges}.
 * Owner-only management: {@code PUT /api/users/me/featured-badges},
 * scoped to the authenticated user and capped at 3 featured badges.</p>
 */
@RestController
public class FeaturedBadgeController {

    private static final int MAX_FEATURED = 3;

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

    public FeaturedBadgeController(UserBadgeRepository userBadgeRepository,
                                   BadgeRepository badgeRepository,
                                   UserRepository userRepository) {
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Public list of a user's featured badges (max 3), with badge details.
     */
    @GetMapping("/api/users/{userId}/featured-badges")
    public ResponseEntity<List<FeaturedBadgeResponse>> listFeatured(@PathVariable Long userId) {
        List<UserBadge> featured = userBadgeRepository.findByUserIdAndFeaturedTrue(userId);
        if (featured.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(buildResponses(featured));
    }

    /**
     * List the current user's earned badges with their featured status, for
     * the owner's edit dialog.
     */
    @GetMapping("/api/users/me/earned-badges")
    public ResponseEntity<List<EarnedBadgeResponse>> listEarned(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<UserBadge> earned = userBadgeRepository.findByUserId(me.getId());
        if (earned.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<Long> badgeIds = earned.stream().map(UserBadge::getBadgeId).toList();
        Map<Long, Badge> badgeMap = badgeRepository.findAllById(badgeIds).stream()
                .collect(Collectors.toMap(Badge::getId, Function.identity()));
        List<EarnedBadgeResponse> body = earned.stream()
                .map(ub -> {
                    Badge b = badgeMap.get(ub.getBadgeId());
                    return new EarnedBadgeResponse(
                            ub.getId(),
                            ub.getBadgeId(),
                            b != null ? b.getName() : null,
                            b != null ? b.getDescription() : null,
                            b != null ? b.getIcon() : null,
                            ub.getEarnedAt(),
                            ub.getFeatured()
                    );
                })
                .toList();
        return ResponseEntity.ok(body);
    }

    /**
     * Set the current user's featured badges. The request body contains a
     * list of badge IDs (not user-badge IDs) to feature. At most 3 may be
     * featured; only badges the user has actually earned will be featured.
     */
    @PutMapping("/api/users/me/featured-badges")
    @Transactional
    public ResponseEntity<List<FeaturedBadgeResponse>> setFeatured(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SetFeaturedBadgesRequest request) {
        User me = getUserFromDetails(userDetails);
        List<Long> requestedBadgeIds = request.badgeIds() == null
                ? List.of()
                : request.badgeIds();
        if (requestedBadgeIds.size() > MAX_FEATURED) {
            throw new IllegalArgumentException(
                    "At most " + MAX_FEATURED + " badges can be featured");
        }

        Set<Long> requested = Set.copyOf(requestedBadgeIds);
        List<UserBadge> all = userBadgeRepository.findByUserId(me.getId());
        for (UserBadge ub : all) {
            ub.setFeatured(requested.contains(ub.getBadgeId()));
        }
        userBadgeRepository.saveAll(all);

        List<UserBadge> featured = all.stream()
                .filter(UserBadge::getFeatured)
                .toList();
        return ResponseEntity.ok(buildResponses(featured));
    }

    private List<FeaturedBadgeResponse> buildResponses(List<UserBadge> featured) {
        List<Long> badgeIds = featured.stream().map(UserBadge::getBadgeId).toList();
        Map<Long, Badge> badgeMap = badgeRepository.findAllById(badgeIds).stream()
                .collect(Collectors.toMap(Badge::getId, Function.identity()));
        return featured.stream()
                .map(ub -> {
                    Badge b = badgeMap.get(ub.getBadgeId());
                    return new FeaturedBadgeResponse(
                            ub.getId(),
                            ub.getBadgeId(),
                            b != null ? b.getName() : null,
                            b != null ? b.getDescription() : null,
                            b != null ? b.getIcon() : null,
                            ub.getEarnedAt()
                    );
                })
                .toList();
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
