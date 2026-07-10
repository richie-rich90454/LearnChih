package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.NoteEditEvent;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

/**
 * WebSocket controller for collaborative note editing (F14). A collaborator
 * publishes an edit event to {@code /app/notes/{id}/edit}; this controller
 * enriches it with the sender's identity and relays it to
 * {@code /topic/notes/{id}} so every open editor receives the update instantly.
 * The 3-second REST poll is a fallback for missed broadcasts.
 */
@Controller
public class NoteWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public NoteWebSocketController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @MessageMapping("/notes/{id}/edit")
    public void editNote(@DestinationVariable Long id, NoteEditEvent incoming, Principal principal) {
        User user = getUser(principal);
        NoteEditEvent event = new NoteEditEvent(
                id,
                user.getId(),
                user.getName(),
                incoming.title(),
                incoming.content(),
                LocalDateTime.now()
        );
        messagingTemplate.convertAndSend("/topic/notes/" + id, event);
    }

    private User getUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
