package com.richardjiang880.lernchih.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Loads development seed data when the {@code dev} Spring profile is active.
 *
 * The seed script lives under {@code classpath:db/seed} so that Flyway does not
 * execute it automatically; this component runs it explicitly after the
 * application context (and therefore Flyway migrations) have completed.
 *
 * This bean is only created for the {@code dev} profile, ensuring the seed data
 * never runs in production or during test runs.
 */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    @Value("classpath:db/seed/V999__dev_seed_data.sql")
    private Resource seedScript;

    private final DataSource dataSource;

    public DevDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        log.info("Dev profile active - loading development seed data...");
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(seedScript);
        populator.execute(dataSource);
        log.info("Development seed data loaded successfully.");
    }
}
