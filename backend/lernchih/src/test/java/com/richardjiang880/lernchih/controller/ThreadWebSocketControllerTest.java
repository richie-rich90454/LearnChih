package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.BroadcastMessage;
import com.richardjiang880.lernchih.dto.ReadReceiptEvent;
import com.richardjiang880.lernchih.dto.TypingEvent;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.security.Principal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThreadWebSocketControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private UserRepository userRepository;

    private ThreadWebSocketController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new ThreadWebSocketController(messagingTemplate, userRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
    }

    private Principal principal() {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn(user.getEmail());
        return principal;
    }

    @Test
    void typingSendsTypingEvent() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        controller.typing(10L, principal());

        verify(messagingTemplate).convertAndSend(eq("/topic/thread/10/typing"), any(TypingEvent.class));
    }

    @Test
    void readSendsReadReceipt() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        ReadReceiptEvent incoming = new ReadReceiptEvent(10L, 5L, null, null);

        controller.read(10L, incoming, principal());

        verify(messagingTemplate).convertAndSend(eq("/topic/thread/10/read"), any(ReadReceiptEvent.class));
    }

    @Test
    void broadcastAllowedForAdmin() {
        User admin = User.builder().email("admin@example.com").password("pw").name("Admin").role(Role.ADMIN).build();
        admin.setId(2L);
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        Principal adminPrincipal = mock(Principal.class);
        when(adminPrincipal.getName()).thenReturn(admin.getEmail());

        BroadcastMessage message = new BroadcastMessage("Title", "Hello");
        BroadcastMessage result = controller.broadcast(message, adminPrincipal);

        assertThat(result).isEqualTo(message);
        verify(messagingTemplate).convertAndSend("/topic/broadcast", message);
    }

    @Test
    void broadcastRejectedForStudent() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> controller.broadcast(new BroadcastMessage("Title", "Hello"), principal()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only admins and moderators");
    }
}
