package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.BroadcastMessage;
import com.richardjiang880.lernchih.dto.ReadReceiptEvent;
import com.richardjiang880.lernchih.dto.TypingEvent;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ThreadWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public ThreadWebSocketController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @MessageMapping("/thread/{id}/typing")
    public void typing(@DestinationVariable Long id, Principal principal) {
        User user = getUser(principal);
        TypingEvent event = new TypingEvent(
                id,
                user.getId(),
                user.getName(),
                true,
                LocalDateTime.now()
        );
        messagingTemplate.convertAndSend("/topic/thread/" + id + "/typing", event);
    }

    @MessageMapping("/thread/{id}/read")
    public void read(@DestinationVariable Long id, ReadReceiptEvent incoming, Principal principal) {
        User user = getUser(principal);
        ReadReceiptEvent event = new ReadReceiptEvent(
                id,
                incoming.postId(),
                user.getId(),
                LocalDateTime.now()
        );
        messagingTemplate.convertAndSend("/topic/thread/" + id + "/read", event);
    }

    @MessageMapping("/admin/broadcast")
    public BroadcastMessage broadcast(BroadcastMessage message, Principal principal) {
        User user = getUser(principal);
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.MODERATOR) {
            throw new IllegalArgumentException("Only admins and moderators can broadcast");
        }
        messagingTemplate.convertAndSend("/topic/broadcast", message);
        return message;
    }

    private User getUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
