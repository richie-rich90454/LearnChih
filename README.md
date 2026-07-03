# LernChih

A student forum for sharing learning resources, discussions, and bypassing bad teaching.

*LernChih* — from Germanic *Lern* (learn) and Han *Chih* (智, wisdom).

## What

LernChih is a full-stack web application where students share resources, discuss in channels, earn credits through upvotes and uploads, and moderate content together.

## Stack

- **Backend**: Spring Boot 4.1 / Java 25 / MySQL / Flyway / JWT
- **Frontend**: React 18 / TypeScript / Vite / Fluent UI 2 / TanStack Query / Zustand

## Requirements

- JDK 25+
- Node.js 20+
- MySQL 8+
- Mailpit (for email verification in dev)

## Quick Start

```bash
# Backend
cd backend/lernchih
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API requests to `localhost:8080`.

## Configuration

Backend configuration lives in `backend/lernchih/src/main/resources/application.properties`.
Secrets and environment-specific values are externalized via environment variables (with
sensible defaults for local development where noted).

### Required environment variables

These must be set or the application will fail to start:

- `JWT_SECRET` — JWT signing key (long, random string)
- `DB_PASSWORD` — MySQL database password

### Optional environment variables (with defaults)

- `DB_URL` — JDBC URL (default: `jdbc:mysql://localhost:3306/lernchih_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8mb4`)
- `DB_USERNAME` — MySQL username (default: `root`)
- `MAIL_HOST` — SMTP host (default: `localhost`)
- `MAIL_PORT` — SMTP port (default: `1025`)
- `MAIL_AUTH` — enable SMTP auth (default: `false`)
- `MAIL_STARTTLS` — enable STARTTLS (default: `false`)
- `CORS_ORIGINS` — comma-separated list of allowed CORS origins (default: `http://localhost:5173,http://localhost:3000`)

For local development, set at least `JWT_SECRET` and `DB_PASSWORD`:

```bash
export JWT_SECRET="your-long-random-secret"
export DB_PASSWORD="your-db-password"
cd backend/lernchih
./mvnw spring-boot:run
```

In production, provide these via the systemd environment file (`/etc/lernchih/lernchih.env`,
referenced by `lernchih.service`).

## Production Build

### Windows

```powershell
# Build frontend into backend static resources and package the JAR
.\build.ps1

# Run from the repository root
java -Xmx512m -jar backend\lernchih\target\lernchih-0.0.1-SNAPSHOT.jar
```

### Linux / macOS

```bash
# Build frontend into backend static resources and package the JAR
chmod +x build.sh
./build.sh

# Run from the repository root
java -Xmx512m -jar backend/lernchih/target/lernchih-0.0.1-SNAPSHOT.jar
```

A systemd service file is provided at `lernchih.service`.

## Project Structure

```
backend/lernchih/src/main/java/com/richardjiang880/lernchih/
  config/          Security, WebSocket configuration
  controller/      REST API endpoints
  dto/             Request/response objects
  model/           JPA entities
  repository/      Spring Data JPA interfaces
  security/        JWT filter, UserDetailsService
  service/         Business logic

frontend/src/
  api/             Axios API layer
  components/      Shared React components
  hooks/           TanStack Query hooks
  pages/           Route page components
  store/           Zustand state management
  types/           TypeScript type definitions
```

## Database

Schema is managed by Flyway. The initial migration creates 14 tables with utf8mb4:

```
users, resources, resource_threads, resource_posts,
channels, channel_threads, channel_posts,
upvotes, reports, subjects, user_subjects,
courses, topics, user_socials
```

## License

MIT
