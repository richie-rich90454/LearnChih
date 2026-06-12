package com.richardjiang880.opensolutions.controller;

import com.richardjiang880.opensolutions.dto.*;
import com.richardjiang880.opensolutions.model.User;
import com.richardjiang880.opensolutions.repository.UserRepository;
import com.richardjiang880.opensolutions.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/threads")
/**
 * REST controller for resource thread post operations.
 */
public class ThreadController {

    private final ThreadService threadService;
    private final UserRepository userRepository;

    public ThreadController(ThreadService threadService, UserRepository userRepository) {
        this.threadService = threadService;
        this.userRepository = userRepository;
    }

    @PostMapping("/resource/{threadId}/posts")
    public ResponseEntity<PostResponse> createResourcePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long threadId,
            @Valid @RequestBody CreatePostRequest request) {
        User user = getUserFromDetails(userDetails);
        PostResponse response = threadService.createResourcePost(threadId, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resource/{threadId}/posts")
    public ResponseEntity<Page<PostResponse>> getResourcePosts(
            @PathVariable Long threadId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(threadService.getResourcePosts(threadId, pageable));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
