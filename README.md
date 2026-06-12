# OpenSolutions

A student forum for sharing learning resources, discussions, and bypassing bad teaching.

## What

OpenSolutions is a full-stack web application where students share resources, discuss in channels, earn credits through upvotes and uploads, and moderate content together.

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
cd backend/opensolutions
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API requests to `localhost:8080`.

## Configuration

Backend configuration lives in `backend/opensolutions/src/main/resources/application.properties`.

Key properties:
- `spring.datasource.*` — MySQL connection
- `app.jwt.secret` — JWT signing key
- `spring.mail.*` — SMTP settings
- `app.mail.from` — sender address

## Production Build

```powershell
# Build frontend into backend static resources
./build.ps1

# Package single JAR
cd backend/opensolutions
./mvnw package -DskipTests

# Run
java -Xmx512m -jar target/opensolutions-0.0.1-SNAPSHOT.jar
```

A systemd service file is provided at `opensolutions.service`.

## Project Structure

```
backend/opensolutions/src/main/java/com/richardjiang880/opensolutions/
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
