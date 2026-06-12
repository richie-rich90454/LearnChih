package com.richardjiang880.opensolutions.controller;

import com.richardjiang880.opensolutions.dto.*;
import com.richardjiang880.opensolutions.model.Resource;
import com.richardjiang880.opensolutions.model.ResourceCategory;
import com.richardjiang880.opensolutions.model.User;
import com.richardjiang880.opensolutions.repository.UpvoteRepository;
import com.richardjiang880.opensolutions.repository.UserRepository;
import com.richardjiang880.opensolutions.service.GamificationService;
import com.richardjiang880.opensolutions.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
/**
 * REST controller for resource CRUD and upvote operations.
 */
public class ResourceController {

    private final ResourceService resourceService;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;
    private final UpvoteRepository upvoteRepository;

    public ResourceController(ResourceService resourceService,
                              GamificationService gamificationService,
                              UserRepository userRepository,
                              UpvoteRepository upvoteRepository) {
        this.resourceService = resourceService;
        this.gamificationService = gamificationService;
        this.userRepository = userRepository;
        this.upvoteRepository = upvoteRepository;
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @ModelAttribute CreateResourceRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        User user = getUserFromDetails(userDetails);
        Resource resource = resourceService.createResource(request, file, user);

        ResourceResponse response = new ResourceResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getCategory().name(),
                resource.getType().name(),
                resource.getFilePath(),
                resource.getExternalUrl(),
                resource.getUser().getId(),
                resource.getUser().getName(),
                resource.getSubject() != null ? resource.getSubject().getId() : null,
                resource.getSubject() != null ? resource.getSubject().getName() : null,
                resource.getUpvoteCount(),
                false,
                resource.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ResourceResponse>> getResources(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) ResourceCategory category,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = userDetails != null ? getUserFromDetails(userDetails).getId() : null;

        Page<Resource> resources = resourceService.getResources(pageable, subjectId, category);

        Page<ResourceResponse> responsePage = resources.map(r -> {
            boolean upvotedByMe = currentUserId != null
                    && upvoteRepository.existsByUserIdAndResourceId(currentUserId, r.getId());
            return new ResourceResponse(
                    r.getId(),
                    r.getTitle(),
                    r.getDescription(),
                    r.getCategory().name(),
                    r.getType().name(),
                    r.getFilePath(),
                    r.getExternalUrl(),
                    r.getUser().getId(),
                    r.getUser().getName(),
                    r.getSubject() != null ? r.getSubject().getId() : null,
                    r.getSubject() != null ? r.getSubject().getName() : null,
                    r.getUpvoteCount(),
                    upvotedByMe,
                    r.getCreatedAt()
            );
        });

        return ResponseEntity.ok(responsePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDetailResponse> getResourceDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = userDetails != null ? getUserFromDetails(userDetails).getId() : null;
        ResourceDetailResponse response = resourceService.getResourceDetail(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        resourceService.deleteResource(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Void> toggleUpvote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        gamificationService.toggleUpvote(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
