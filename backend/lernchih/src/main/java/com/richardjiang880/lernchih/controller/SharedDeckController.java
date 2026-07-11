package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.SharedDeckDtos.ShareRequest;
import com.richardjiang880.lernchih.dto.SharedDeckDtos.SharedDeckResponse;
import com.richardjiang880.lernchih.model.FlashcardDeck;
import com.richardjiang880.lernchih.model.SharedDeck;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.FlashcardDeckRepository;
import com.richardjiang880.lernchih.repository.SharedDeckRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for flashcard-deck sharing (F15). Exposes endpoints for an
 * owner to share a deck with another user by email or username, list decks
 * shared with / by the current user, and revoke an existing share.
 */
@RestController
public class SharedDeckController {

    private final SharedDeckRepository sharedDeckRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final UserRepository userRepository;

    public SharedDeckController(SharedDeckRepository sharedDeckRepository,
                                FlashcardDeckRepository flashcardDeckRepository,
                                UserRepository userRepository) {
        this.sharedDeckRepository = sharedDeckRepository;
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/flashcard-decks/{deckId}/share")
    public ResponseEntity<SharedDeckResponse> share(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long deckId,
            @RequestBody ShareRequest request) {
        User sharer = getUserFromDetails(userDetails);

        FlashcardDeck deck = flashcardDeckRepository.findById(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Deck not found"));
        if (!deck.getUserId().equals(sharer.getId())) {
            throw new IllegalStateException("Only the deck owner can share it");
        }
        if (request == null
                || request.recipientEmailOrUsername() == null
                || request.recipientEmailOrUsername().isBlank()) {
            throw new IllegalArgumentException("Recipient identifier is required");
        }

        String recipientId = request.recipientEmailOrUsername().trim();
        Optional<User> byEmail = userRepository.findByEmail(recipientId);
        Optional<User> byName = byEmail.isPresent()
                ? byEmail
                : userRepository.findAll().stream()
                        .filter(u -> u.getName() != null
                                && u.getName().equalsIgnoreCase(recipientId))
                        .findFirst();
        User recipient = byName.orElseThrow(
                () -> new IllegalArgumentException("Recipient user not found"));
        if (recipient.getId().equals(sharer.getId())) {
            throw new IllegalStateException("You cannot share a deck with yourself");
        }

        SharedDeck.Permission permission = request.permission() == null
                ? SharedDeck.Permission.VIEW
                : request.permission();

        // Upsert: if a share already exists for this (deck, recipient) pair,
        // update its permission rather than creating a duplicate row.
        SharedDeck share = sharedDeckRepository
                .findByDeckIdAndSharedWithUserId(deckId, recipient.getId())
                .orElseGet(() -> SharedDeck.builder()
                        .deckId(deckId)
                        .sharedByUserId(sharer.getId())
                        .sharedWithUserId(recipient.getId())
                        .build());
        share.setPermission(permission);
        share = sharedDeckRepository.save(share);
        return ResponseEntity.ok(toResponse(share, deck, sharer, recipient));
    }

    @GetMapping("/api/flashcard-decks/shared-with-me")
    public ResponseEntity<List<SharedDeckResponse>> sharedWithMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<SharedDeckResponse> rows = sharedDeckRepository
                .findBySharedWithUserIdOrderBySharedAtDesc(me.getId())
                .stream()
                .map(s -> toResponse(s,
                        flashcardDeckRepository.findById(s.getDeckId()).orElse(null),
                        userRepository.findById(s.getSharedByUserId()).orElse(null),
                        me))
                .toList();
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/api/flashcard-decks/shared-by-me")
    public ResponseEntity<List<SharedDeckResponse>> sharedByMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<SharedDeckResponse> rows = sharedDeckRepository
                .findBySharedByUserIdOrderBySharedAtDesc(me.getId())
                .stream()
                .map(s -> toResponse(s,
                        flashcardDeckRepository.findById(s.getDeckId()).orElse(null),
                        me,
                        userRepository.findById(s.getSharedWithUserId()).orElse(null)))
                .toList();
        return ResponseEntity.ok(rows);
    }

    @DeleteMapping("/api/shared-decks/{id}")
    public ResponseEntity<Void> revokeShare(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        SharedDeck share = sharedDeckRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shared deck entry not found"));
        boolean owner = share.getSharedByUserId().equals(me.getId());
        boolean recipient = share.getSharedWithUserId().equals(me.getId());
        if (!owner && !recipient) {
            throw new IllegalStateException("You can only revoke shares you own or received");
        }
        sharedDeckRepository.delete(share);
        return ResponseEntity.noContent().build();
    }

    private SharedDeckResponse toResponse(SharedDeck share,
                                          FlashcardDeck deck,
                                          User sharer,
                                          User recipient) {
        return new SharedDeckResponse(
                share.getId(),
                share.getDeckId(),
                deck != null ? deck.getName() : null,
                share.getSharedByUserId(),
                sharer != null ? sharer.getName() : null,
                share.getSharedWithUserId(),
                recipient != null ? recipient.getName() : null,
                share.getPermission(),
                share.getSharedAt()
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
