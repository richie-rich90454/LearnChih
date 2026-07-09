package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ThreadSubscriptionDtos.ThreadSubscriptionResponse;
import com.richardjiang880.lernchih.dto.ThreadSubscriptionDtos.UpdateSubscriptionRequest;
import com.richardjiang880.lernchih.model.ThreadSubscription;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.DigestFrequency;
import com.richardjiang880.lernchih.repository.ThreadSubscriptionRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST controller for per-thread subscription digest frequency (F33).
 */
@RestController
@RequestMapping("/api/threads/{threadId}/subscription")
public class ThreadSubscriptionController {

    private final ThreadSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public ThreadSubscriptionController(ThreadSubscriptionRepository subscriptionRepository,
                                        UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get the current user's subscription for the given thread. Returns a
     * NONE-frequency subscription when none exists yet.
     */
    @GetMapping
    public ResponseEntity<ThreadSubscriptionResponse> getSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long threadId) {
        User me = getUserFromDetails(userDetails);
        ThreadSubscription sub = subscriptionRepository
                .findByUserIdAndThreadId(me.getId(), threadId)
                .orElseGet(() -> ThreadSubscription.builder()
                        .userId(me.getId())
                        .threadId(threadId)
                        .frequency(DigestFrequency.NONE)
                        .build());
        return ResponseEntity.ok(toResponse(sub));
    }

    /**
     * Create or update the current user's subscription frequency for the
     * given thread.
     */
    @PutMapping
    public ResponseEntity<ThreadSubscriptionResponse> updateSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long threadId,
            @Valid @RequestBody UpdateSubscriptionRequest request) {
        User me = getUserFromDetails(userDetails);
        ThreadSubscription sub = subscriptionRepository
                .findByUserIdAndThreadId(me.getId(), threadId)
                .orElseGet(() -> ThreadSubscription.builder()
                        .userId(me.getId())
                        .threadId(threadId)
                        .build());
        sub.setFrequency(request.frequency() == null ? DigestFrequency.NONE : request.frequency());
        sub = subscriptionRepository.save(sub);
        return ResponseEntity.ok(toResponse(sub));
    }

    /**
     * Remove the subscription (equivalent to setting frequency to NONE).
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long threadId) {
        User me = getUserFromDetails(userDetails);
        Optional<ThreadSubscription> existing = subscriptionRepository
                .findByUserIdAndThreadId(me.getId(), threadId);
        existing.ifPresent(subscriptionRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private ThreadSubscriptionResponse toResponse(ThreadSubscription sub) {
        return new ThreadSubscriptionResponse(
                sub.getId(),
                sub.getUserId(),
                sub.getThreadId(),
                sub.getFrequency(),
                sub.getLastDigestAt()
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
