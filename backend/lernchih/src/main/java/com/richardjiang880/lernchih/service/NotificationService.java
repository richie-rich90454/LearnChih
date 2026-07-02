package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Notification;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NotificationRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final PushService pushService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               MailService mailService,
                               PushService pushService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.pushService = pushService;
    }

    @Transactional
    public Notification createNotification(Long userId, String type, String title, String body, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .actionUrl(actionUrl)
                .build();

        notification = notificationRepository.save(notification);

        // Send push notification if a subscription exists
        if (user.getPushSubscription() != null && !user.getPushSubscription().isBlank()) {
            pushService.sendPush(userId, title, body);
        }

        // Send email if the user has enabled email notifications
        // TODO: make email delivery resilient (queue / async fallback) when email config is ready
        if (Boolean.TRUE.equals(user.getEmailNotificationsEnabled())) {
            try {
                mailService.sendNotificationEmail(user.getEmail(), title, body != null ? body : "");
            } catch (Exception e) {
                // TODO: log to a dead-letter queue or notification delivery log
                System.err.println("Failed to send notification email to " + user.getEmail() + ": " + e.getMessage());
            }
        }

        return notification;
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Notification> findById(Long id) {
        return notificationRepository.findById(id);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !Boolean.TRUE.equals(n.getRead()))
                .toList();

        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
