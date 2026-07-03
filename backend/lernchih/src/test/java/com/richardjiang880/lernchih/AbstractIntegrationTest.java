package com.richardjiang880.lernchih;

import ch.martinelli.oss.testcontainers.mailpit.MailpitContainer;
import com.richardjiang880.lernchih.support.EnabledIfDockerAvailable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for integration tests that require a real MySQL database and Mailpit SMTP server.
 *
 * <p>Starts a Testcontainers MySQL 8 container, wires its JDBC URL into the
 * Spring {@code DataSource}, and lets Flyway run the migration scripts from
 * {@code classpath:db/migration}. Also starts a Mailpit container and wires the
 * SMTP connection details into Spring Boot mail properties.
 *
 * <p>Required environment variables {@code JWT_SECRET} and {@code DB_PASSWORD}
 * are supplied by the Maven Surefire plugin configuration. This base class also
 * exposes them as Spring properties so individual tests can be run from an IDE.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@EnabledIfDockerAvailable
public abstract class AbstractIntegrationTest {

    private static final String JWT_SECRET = "test-jwt-secret-with-at-least-32-characters-long";
    private static final String DB_PASSWORD = "test";

    @Container
    protected static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("lernchih_test")
            .withUsername("test")
            .withPassword(DB_PASSWORD);

    @Container
    protected static final MailpitContainer mailpit = new MailpitContainer("axllent/mailpit:v1.21");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.datasource.driver-class-name", mysql::getDriverClassName);

        registry.add("app.jwt.secret", () -> JWT_SECRET);
        registry.add("app.jwt.expiration", () -> 86400000L);
        registry.add("app.jwt.refresh-expiration", () -> 604800000L);
        registry.add("app.upload.dir", () -> "./uploads-test");
        registry.add("app.security.https-only", () -> false);
        registry.add("app.seo.base-url", () -> "http://localhost:5173");
        registry.add("spring.mail.host", mailpit::getSmtpHost);
        registry.add("spring.mail.port", mailpit::getSmtpPort);
    }
}
