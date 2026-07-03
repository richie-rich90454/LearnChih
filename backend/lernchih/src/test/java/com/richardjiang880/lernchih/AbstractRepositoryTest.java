package com.richardjiang880.lernchih;

import com.richardjiang880.lernchih.support.EnabledIfDockerAvailable;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for repository tests that run against a real Testcontainers MySQL database.
 *
 * <p>Uses {@code @DataJpaTest} with {@code @AutoConfigureTestDatabase(replace = NONE)}
 * so that Spring Boot does not replace the DataSource with an embedded database.
 * Hibernate is configured to create and drop the schema for each test context.
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
@EnabledIfDockerAvailable
public abstract class AbstractRepositoryTest {

    private static final String DB_PASSWORD = "test";

    @Container
    protected static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("lernchih_test")
            .withUsername("test")
            .withPassword(DB_PASSWORD);

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.datasource.driver-class-name", mysql::getDriverClassName);
    }
}
