package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Notification;
import com.richardjiang880.lernchih.model.User;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
/**
 * Email service for sending verification codes asynchronously.
 */
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Sends email asynchronously to avoid blocking the request thread
    @Async
    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("LernChih - Verify Your Email");
        message.setText(
            "Welcome to LernChih!\n\n" +
            "Your verification code is: " + code + "\n\n" +
            "This code expires in 15 minutes.\n\n" +
            "If you did not create an account, please ignore this email."
        );
        mailSender.send(message);
    }

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Async
    public void sendDigestEmail(User user, List<Notification> notifications) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body>");
        html.append("<h2>Hi ").append(escapeHtml(user.getName())).append(", here is your notification digest</h2>");
        html.append("<ul>");
        for (Notification n : notifications) {
            html.append("<li><strong>").append(escapeHtml(n.getTitle())).append("</strong>");
            if (n.getBody() != null) {
                html.append("<br/>").append(escapeHtml(n.getBody()));
            }
            html.append("</li>");
        }
        html.append("</ul>");
        html.append("</body></html>");

        // TODO: switch to MimeMessageHelper for true HTML emails when email config is ready
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("LernChih - Notification Digest");
        message.setText(html.toString());
        mailSender.send(message);
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
