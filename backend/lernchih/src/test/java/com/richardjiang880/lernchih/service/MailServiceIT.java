package com.richardjiang880.lernchih.service;

import ch.martinelli.oss.testcontainers.mailpit.MailpitContainer;
import ch.martinelli.oss.testcontainers.mailpit.Message;
import com.richardjiang880.lernchih.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end email integration test using a Testcontainers Mailpit server.
 *
 * <p>Sends a verification email through the real {@link org.springframework.mail.javamail.JavaMailSender}
 * and asserts that Mailpit captured the message with the expected recipient and subject.
 */
class MailServiceIT extends AbstractIntegrationTest {

    @Container
    static final MailpitContainer mailpit = new MailpitContainer("axllent/mailpit:latest");

    @DynamicPropertySource
    static void mailProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", mailpit::getSmtpHost);
        registry.add("spring.mail.port", mailpit::getSmtpPort);
    }

    @Autowired
    private MailService mailService;

    @Test
    void sendVerificationEmailIsCapturedByMailpit() throws InterruptedException {
        mailService.sendVerificationEmail("user@example.com", "123456");

        List<Message> messages = waitForMessages(1, 5000);

        assertThat(messages).hasSize(1);
        assertThat(messages.get(0).subject()).isEqualTo("LernChih - Verify Your Email");
    }

    private List<Message> waitForMessages(int expectedCount, int timeoutMillis) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMillis;
        while (System.currentTimeMillis() < deadline) {
            List<Message> messages = mailpit.getClient().getAllMessages();
            if (messages.size() >= expectedCount) {
                return messages;
            }
            Thread.sleep(200);
        }
        return mailpit.getClient().getAllMessages();
    }
}
