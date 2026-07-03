package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Notification;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private MailService mailService;

    @Test
    void sendVerificationEmailSendsMessageWithCode() {
        mailService.sendVerificationEmail("alice@example.com", "123456");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertThat(message.getTo()).containsExactly("alice@example.com");
        assertThat(message.getSubject()).isEqualTo("LernChih - Verify Your Email");
        assertThat(message.getText()).contains("123456");
    }

    @Test
    void sendNotificationEmailSendsMessage() {
        mailService.sendNotificationEmail("alice@example.com", "Hello", "World");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        assertThat(captor.getValue().getSubject()).isEqualTo("Hello");
        assertThat(captor.getValue().getText()).isEqualTo("World");
    }

    @Test
    void sendDigestEmailEscapesHtmlAndSends() {
        User user = User.builder().email("alice@example.com").name("<Alice>").build();
        Notification n = Notification.builder().title("<alert>").body("<script>").build();

        mailService.sendDigestEmail(user, List.of(n));

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        String text = captor.getValue().getText();
        assertThat(text).contains("&lt;Alice&gt;");
        assertThat(text).contains("&lt;alert&gt;");
        assertThat(text).contains("&lt;script&gt;");
    }
}
