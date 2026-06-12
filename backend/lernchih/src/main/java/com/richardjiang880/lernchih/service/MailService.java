package com.richardjiang880.lernchih.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
}
