package com.richardjiang880.lernchih.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Loads development seed data when {@code app.seed.enabled=true}.
 *
 * The seed script lives under {@code classpath:db/seed} so that Flyway does not
 * execute it automatically; this component runs it explicitly after the
 * application context (and therefore Flyway migrations) have completed.
 *
 * Seeding is disabled by default and must be opted in via the
 * {@code app.seed.enabled} property. It should never be enabled in production.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    @Value("classpath:db/seed/V1000__seed_data.sql")
    private Resource seedScript;

    private final DataSource dataSource;

    public DevDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        log.info("app.seed.enabled=true - loading course catalog seed data...");
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(seedScript);
        populator.execute(dataSource);
        log.info("Course catalog seed data loaded successfully.");
    }
}
