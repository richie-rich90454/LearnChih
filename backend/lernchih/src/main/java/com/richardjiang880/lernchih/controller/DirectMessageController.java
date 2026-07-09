package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.DirectMessageDtos.ConversationSummary;
import com.richardjiang880.lernchih.dto.DirectMessageDtos.DirectMessageResponse;
import com.richardjiang880.lernchih.dto.DirectMessageDtos.SendDirectMessageRequest;
import com.richardjiang880.lernchih.model.DirectMessage;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.DirectMessageRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.PresenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for 1:1 direct messages (F31).
 */
@RestController
@RequestMapping("/api/dm")
public class DirectMessageController {

    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final PresenceService presenceService;

    public DirectMessageController(DirectMessageRepository directMessageRepository,
                                   UserRepository userRepository,
                                   PresenceService presenceService) {
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
        this.presenceService = presenceService;
    }

    /**
     * Fetch the conversation between the current user and {@code userId}.
     * Marks inbound (to me) unread messages as read.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<DirectMessageResponse>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        User me = getUserFromDetails(userDetails);
        List<DirectMessage> messages = directMessageRepository.findConversation(me.getId(), userId);

        // Mark messages addressed to me as read.
        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;
        for (DirectMessage m : messages) {
            if (m.getToUserId().equals(me.getId()) && m.getReadAt() == null) {
                m.setReadAt(now);
                changed = true;
            }
        }
        if (changed) {
            directMessageRepository.saveAll(messages.stream()
                    .filter(m -> m.getReadAt() != null && m.getReadAt().equals(now))
                    .toList());
        }

        // Heartbeat: opening a conversation implies the user is online.
        presenceService.heartbeat(me.getId());

        return ResponseEntity.ok(messages.stream().map(this::toResponse).toList());
    }

    /**
     * Send a direct message to {@code userId}.
     */
    @PostMapping("/{userId}")
    public ResponseEntity<DirectMessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId,
            @Valid @RequestBody SendDirectMessageRequest request) {
        User me = getUserFromDetails(userDetails);

        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }
        if (userId.equals(me.getId())) {
            throw new IllegalArgumentException("Cannot send a message to yourself");
        }
        // Ensure the recipient exists.
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        DirectMessage message = DirectMessage.builder()
                .fromUserId(me.getId())
                .toUserId(userId)
                .content(request.content())
                .build();
        message = directMessageRepository.save(message);
        return ResponseEntity.ok(toResponse(message));
    }

    /**
     * List all conversations for the current user, most recently active first.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummary>> conversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<Long> partnerIds = directMessageRepository.findConversationPartnerIds(me.getId());

        Map<Long, List<DirectMessage>> byPartner = new HashMap<>();
        for (Long partnerId : partnerIds) {
            byPartner.put(partnerId, directMessageRepository.findConversation(me.getId(), partnerId));
        }

        List<ConversationSummary> summaries = new ArrayList<>();
        for (Map.Entry<Long, List<DirectMessage>> entry : byPartner.entrySet()) {
            List<DirectMessage> convo = entry.getValue();
            if (convo.isEmpty()) continue;
            DirectMessage last = convo.get(convo.size() - 1);
            long unread = convo.stream()
                    .filter(m -> m.getToUserId().equals(me.getId()) && m.getReadAt() == null)
                    .count();
            String partnerName = userRepository.findById(entry.getKey())
                    .map(User::getName)
                    .orElse("Unknown");
            String preview = last.getContent();
            if (preview != null && preview.length() > 60) {
                preview = preview.substring(0, 57) + "...";
            }
            summaries.add(new ConversationSummary(
                    entry.getKey(),
                    partnerName,
                    last.getSentAt(),
                    preview,
                    unread
            ));
        }
        summaries.sort(Comparator.comparing(ConversationSummary::lastMessageAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return ResponseEntity.ok(summaries);
    }

    private DirectMessageResponse toResponse(DirectMessage m) {
        return new DirectMessageResponse(
                m.getId(),
                m.getFromUserId(),
                m.getToUserId(),
                m.getContent(),
                m.getSentAt(),
                m.getReadAt()
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
