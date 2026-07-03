package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.Notification;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;
    @Mock
    private UserRepository userRepository;

    private NotificationController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new NotificationController(notificationService, userRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void getNotificationsReturnsList() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Notification notification = Notification.builder().user(user).type("INFO").title("Hello").build();
        when(notificationService.getNotifications(1L)).thenReturn(List.of(notification));

        ResponseEntity<List<Notification>> result = controller.getNotifications(userDetails());

        assertThat(result.getBody()).hasSize(1);
    }

    @Test
    void markAsReadForOwnNotification() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Notification notification = Notification.builder().user(user).type("INFO").title("Hello").build();
        notification.setId(5L);
        when(notificationService.findById(5L)).thenReturn(Optional.of(notification));
        when(notificationService.markAsRead(5L)).thenReturn(notification);

        ResponseEntity<Notification> result = controller.markAsRead(userDetails(), 5L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void markAsReadRejectsForeignNotification() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        User other = User.builder().email("bob@example.com").password("pw").name("Bob").role(Role.STUDENT).build();
        other.setId(2L);
        Notification notification = Notification.builder().user(other).type("INFO").title("Hello").build();
        notification.setId(5L);
        when(notificationService.findById(5L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> controller.markAsRead(userDetails(), 5L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    void markAllAsReadDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<Void> result = controller.markAllAsRead(userDetails());

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(notificationService).markAllAsRead(1L);
    }
}
