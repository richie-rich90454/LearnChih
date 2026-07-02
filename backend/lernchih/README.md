# LernChih Backend

Spring Boot REST API and WebSocket backend for the LernChih learning community platform.

## Requirements

- Java 25+
- MySQL 8.0+ or MariaDB 10.6+
- Maven (the wrapper `mvnw` / `mvnw.cmd` is included)

## Quick Start

1. Create the database:

   ```sql
   CREATE DATABASE lernchih_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Configure environment variables (or rely on the defaults for local dev):

   ```bash
   export DB_URL="jdbc:mysql://localhost:3306/lernchih_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8mb4"
   export DB_USERNAME="root"
   export DB_PASSWORD="your-db-password"
   export JWT_SECRET="your-jwt-secret-with-at-least-32-characters"
   ```

3. Run the application:

   ```bash
   ./mvnw spring-boot:run
   ```

   On Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

## Running with Development Seed Data

The `dev` profile loads realistic local development data (users, subjects, courses, resources, channels, badges, etc.).

1. Create a dedicated dev database:

   ```sql
   CREATE DATABASE lernchih_dev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Start the backend with the `dev` profile:

   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

   On Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. Log in with any seeded demo account. All demo passwords are `password123`:

   - `alice@example.com` (ADMIN)
   - `bob@example.com` (MODERATOR)
   - `carol@example.com` (STUDENT)
   - `dave@example.com` (STUDENT)
   - `eve@example.com` (STUDENT)
   - `frank@example.com` (STUDENT)
   - `grace@example.com` (STUDENT)
   - `henry@example.com` (STUDENT)

The seed data is located at `src/main/resources/db/seed/V999__dev_seed_data.sql` and is executed by `DevDataSeeder` only when the `dev` profile is active. It uses `INSERT IGNORE` and is safe to re-run on every startup.

## Build & Test

```bash
# Verify the wrapper works
./mvnw -version

# Compile
./mvnw clean compile

# Run tests
./mvnw test

# Package (skip tests)
./mvnw clean package -DskipTests
```

## Project Structure

- `src/main/java/com/richardjiang880/lernchih` - Application source
- `src/main/resources/db/migration` - Flyway schema migrations
- `src/main/resources/db/seed` - Optional dev-only seed data
- `src/test` - Unit and integration tests
