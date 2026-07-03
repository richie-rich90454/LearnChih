package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Notification;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NotificationRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MailService mailService;

    @Mock
    private PushService pushService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void createNotificationSavesAndSendsPushAndEmail() {
        User user = User.builder().id(1L).email("alice@example.com").pushSubscription("sub").emailNotificationsEnabled(true).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification notification = notificationService.createNotification(1L, "info", "Title", "Body", "/action");

        assertThat(notification.getUser()).isEqualTo(user);
        assertThat(notification.getTitle()).isEqualTo("Title");
        verify(pushService).sendPush(1L, "Title", "Body");
        verify(mailService).sendNotificationEmail("alice@example.com", "Title", "Body");
    }

    @Test
    void createNotificationThrowsWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.createNotification(99L, "info", "Title", "Body", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getNotificationsReturnsUserNotifications() {
        List<Notification> expected = List.of(Notification.builder().id(1L).build());
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(expected);

        assertThat(notificationService.getNotifications(1L)).isEqualTo(expected);
    }

    @Test
    void markAsReadUpdatesReadFlag() {
        Notification notification = Notification.builder().id(1L).read(false).build();
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification updated = notificationService.markAsRead(1L);

        assertThat(updated.getRead()).isTrue();
    }

    @Test
    void markAllAsReadUpdatesOnlyUnreadNotifications() {
        Notification n1 = Notification.builder().id(1L).read(false).build();
        Notification n2 = Notification.builder().id(2L).read(true).build();
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead(1L);

        assertThat(n1.getRead()).isTrue();
        verify(notificationRepository).saveAll(List.of(n1));
    }
}
