package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.ChannelThread;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ChannelThreadRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
/**
 * REST controller for channel and channel thread operations.
 */
public class ChannelController {

    private final ChannelRepository channelRepository;
    private final ChannelThreadRepository channelThreadRepository;
    private final ThreadService threadService;
    private final UserRepository userRepository;

    public ChannelController(ChannelRepository channelRepository,
                             ChannelThreadRepository channelThreadRepository,
                             ThreadService threadService,
                             UserRepository userRepository) {
        this.channelRepository = channelRepository;
        this.channelThreadRepository = channelThreadRepository;
        this.threadService = threadService;
        this.userRepository = userRepository;
    }

    // Channels are read-only - consider caching for production
    @GetMapping
    public ResponseEntity<List<ChannelResponse>> getChannels() {
        List<ChannelResponse> channels = channelRepository.findAll().stream()
                .map(c -> new ChannelResponse(
                        c.getId(),
                        c.getName(),
                        c.getDescription(),
                        c.getThreads().size(),
                        c.getCreatedAt()
                ))
                .toList();
        return ResponseEntity.ok(channels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChannelResponse> getChannel(@PathVariable Long id) {
        Channel channel = channelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        ChannelResponse response = new ChannelResponse(
                channel.getId(),
                channel.getName(),
                channel.getDescription(),
                channel.getThreads().size(),
                channel.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/threads")
    public ResponseEntity<Page<ChannelThreadResponse>> getChannelThreads(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        // Validate channel exists before querying threads
        if (!channelRepository.existsById(id)) {
            throw new IllegalArgumentException("Channel not found");
        }

        Page<ChannelThread> threads = channelThreadRepository.findByChannelIdOrderByCreatedAtDesc(id, pageable);
        Page<ChannelThreadResponse> responsePage = threads.map(t -> new ChannelThreadResponse(
                t.getId(),
                id,
                t.getTitle(),
                t.getUser().getId(),
                t.getUser().getName(),
                t.getPosts().size(),
                t.getCreatedAt()
        ));

        return ResponseEntity.ok(responsePage);
    }

    @PostMapping("/{id}/threads")
    public ResponseEntity<ChannelThreadResponse> createChannelThread(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CreateChannelThreadRequest request) {
        User user = getUserFromDetails(userDetails);
        ChannelThreadResponse response = threadService.createChannelThread(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/threads/{threadId}/posts")
    public ResponseEntity<PostResponse> createChannelPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long threadId,
            @Valid @RequestBody CreatePostRequest request) {
        User user = getUserFromDetails(userDetails);
        PostResponse response = threadService.createChannelPost(threadId, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/threads/{threadId}/posts")
    public ResponseEntity<Page<PostResponse>> getChannelPosts(
            @PathVariable Long threadId,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(threadService.getChannelPosts(threadId, pageable));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
