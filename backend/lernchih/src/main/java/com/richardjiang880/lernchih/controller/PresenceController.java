package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * REST controller for user presence (F31). Exposes online/offline status and a
 * heartbeat endpoint the frontend polls to keep the current user "online".
 */
@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    private final PresenceService presenceService;
    private final UserRepository userRepository;

    public PresenceController(PresenceService presenceService, UserRepository userRepository) {
        this.presenceService = presenceService;
        this.userRepository = userRepository;
    }

    /**
     * Whether the given user is currently online (heartbeat within the window).
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getPresence(@PathVariable Long userId) {
        boolean online = presenceService.isOnline(userId);
        LocalDateTime lastSeen = presenceService.lastSeen(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "online", online,
                "lastSeenAt", lastSeen == null ? "" : lastSeen
        ));
    }

    /**
     * Heartbeat: the current user signals they are active. Called periodically
     * by the frontend (every ~30s) and when they open the messages page.
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Object>> heartbeat(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        presenceService.heartbeat(me.getId());
        return ResponseEntity.ok(Map.of("userId", me.getId(), "online", true));
    }

    /**
     * Mark the current user as going offline (e.g. on page unload).
     */
    @PostMapping("/offline")
    public ResponseEntity<Void> offline(@AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        presenceService.offline(me.getId());
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
