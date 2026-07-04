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
import java.sql.DatabaseMetaData;

/**
 * Loads development seed data when the {@code local} or {@code dev} Spring profile is active.
 *
 * <p>Flyway is disabled in the local profile, so this seeder executes the SQL scripts
 * that would otherwise be applied by Flyway in dev mode. The scripts live under
 * {@code classpath:db/seed/} and are designed to be idempotent.
 *
 * <p>MySQL scripts use {@code INSERT IGNORE} and {@code NOW() - INTERVAL n DAY}; H2 scripts
 * use equivalent H2 syntax. The correct script is selected at runtime from the database
 * product name.
 *
 * <p>Execution is best-effort: any failure is logged but does not abort startup, because
 * local development should remain usable even if a seed row becomes invalid.
 */
@Component
@Profile({"local", "dev"})
public class DevDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    @Value("classpath:db/seed/V999__dev_seed_data.sql")
    private Resource devSeedScript;

    @Value("classpath:db/seed/V999__dev_seed_data_h2.sql")
    private Resource devSeedScriptH2;

    private final DataSource dataSource;

    public DevDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void seed() {
        boolean h2 = isH2();
        log.info("Running development data seeder for local/dev profile (database: {})...", h2 ? "h2" : "mysql");
        execute(h2 ? devSeedScriptH2 : devSeedScript);
        log.info("Development data seeding complete.");
    }

    private boolean isH2() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return metaData.getDatabaseProductName().toLowerCase().contains("h2");
        } catch (Exception e) {
            log.warn("Could not determine database product name, defaulting to MySQL seed scripts", e);
            return false;
        }
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
