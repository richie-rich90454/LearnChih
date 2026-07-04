package com.richardjiang880.lernchih.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Loads development seed data when the {@code dev} Spring profile is active.
 *
 * <p>The {@code local} profile uses an in-memory H2 database and is seeded by
 * {@link DemoDataSeeder} instead. This seeder only runs against MySQL/MariaDB
 * in the {@code dev} profile, executing the Flyway-independent SQL script under
 * {@code classpath:db/seed/}. The script is idempotent ({@code INSERT IGNORE}).
 *
 * <p>Execution is best-effort: any failure is logged but does not abort startup, because
 * local development should remain usable even if a seed row becomes invalid.
 */
@Component
@Profile("dev")
public class DevDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    @Value("classpath:db/seed/V999__dev_seed_data.sql")
    private Resource devSeedScript;

    private final DataSource dataSource;

    public DevDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void seed() {
        log.info("Running development data seeder for dev profile (MySQL)...");
        execute(devSeedScript);
        log.info("Development data seeding complete.");
    }

    private void execute(Resource script) {
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new org.springframework.core.io.support.EncodedResource(script));
            log.debug("Executed seed script: {}", script.getFilename());
        } catch (Exception e) {
            log.error("Failed to execute seed script: {} - {}", script.getFilename(), e.getMessage(), e);
        }
    }
}
