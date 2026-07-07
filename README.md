# LernChih

A student forum for sharing learning resources, discussions, and bypassing bad teaching.

*LernChih* — from Germanic *Lern* (learn) and Han *Chih* (智, wisdom).

## What

LernChih is a full-stack web application where students share resources, discuss in channels, earn credits through upvotes and uploads, and moderate content together.

## Stack

- **Backend**: Spring Boot 4.1 / Java 25 / MySQL / Flyway / JWT
- **Frontend**: React 19 / TypeScript / Vite / Fluent UI 2 / TanStack Query / Zustand

## Requirements

- JDK 25+
- Node.js 20+
- For Docker-backed mode: Docker Engine 24+ and Docker Compose v2+
- For local quick-start mode: nothing extra (uses embedded H2)

## Quick Start

The fastest way to run LernChih is the single-port local mode. Copy one of the example `.env` files to `.env` and run the platform-specific `start-local` script.

### Local quick start (single port, embedded H2)

```bash
# Copy the local example environment file to .env.
cp .env.local.example .env

# Start the backend and the built frontend on one port.
# Windows:
.\start-local.ps1
# Linux / macOS:
./start-local.sh
```

The script loads `.env`, validates that required variables are set, and starts Spring Boot with the `local` profile using the frontend assets already in `backend/lernchih/src/main/resources/static`.

To build or rebuild the frontend first, run `start-local.ps1 -Build` (Windows) or `start-local.sh --build` (Linux / macOS). For repeated backend-only restarts, use `serve-local.ps1` / `serve-local.sh`.

Open `http://localhost:38517` (or the `SERVER_PORT` from `.env`) to use the application. API requests and browser refreshes on nested routes (for example `/channels/general/threads/123`) are handled by the backend SPA fallback.

### Docker-backed development (MySQL + OpenSearch + Mailpit)

For development that matches production data stores, copy the Docker example and start the infrastructure compose stack:

```bash
# Copy the Docker example environment file to .env.
cp .env.docker.example .env

# Build the application JAR first.
# Windows:
.\build.ps1
# Linux / macOS:
./build.sh

# Start the data stores and backend.
docker compose -f infrastructure/docker-compose.yml up -d
```

The backend container waits for MySQL and OpenSearch health checks to pass before it starts. The compose stack reads `.env` from the repository root, so ports and credentials stay in one place.

### Optional Vite HMR development path

For active UI work with fast hot-module replacement, you can still run the Vite dev server separately. It proxies API requests to the Spring Boot backend.

```bash
# Terminal 1: backend (H2 local profile)
cp .env.local.example .env
cd backend/lernchih
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"

# Terminal 2: frontend dev server
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:38517` via Vite's proxy configuration.

## Configuration

Runtime configuration is centralized in a repository-root `.env` file. Secrets and environment-specific values are read from `.env`; `application.properties` provides sensible defaults for non-secret values.

### Example files

- `.env.example` — full template with all required and optional variables, documentation, and production defaults.
- `.env.local.example` — minimal overrides for the single-port H2 quick start. Copy to `.env` before running `start-local`.
- `.env.docker.example` — overrides for the Docker-backed development stack. Copy to `.env` before running `docker compose`.

### Required environment variables

These must be set or the application will fail to start in Docker-backed or packaged-JAR mode:

- `JWT_SECRET` — JWT signing key (long, random string, at least 32 characters)
- `DB_PASSWORD` — MySQL database password

When the `local` Spring profile is active, only `JWT_SECRET` is required; H2 is used in-memory and a development JWT secret is provided by `.env.local.example`.

### Optional environment variables (with defaults)

- `SERVER_PORT` — Spring Boot port (default: `38517`)
- `DB_URL` — JDBC URL (default: `jdbc:mysql://localhost:3306/lernchih_db?useSSL=false&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8`)
- `DB_USERNAME` — MySQL username (default: `root`)
- `MAIL_HOST` — SMTP host (default: `localhost`)
- `MAIL_PORT` — SMTP port (default: `1025`)
- `MAIL_AUTH` — enable SMTP auth (default: `false`)
- `MAIL_STARTTLS` — enable STARTTLS (default: `false`)
- `CORS_ORIGINS` — comma-separated list of allowed CORS origins (default: `http://localhost:5173,http://localhost:3000`)
- `SEO_BASE_URL` — public base URL for SEO metadata (default: `http://localhost:5173`)

For a full list see `.env.example`.

### Seeding the database

Demo data is provided by `DemoDataSeeder`, a `CommandLineRunner` gated by the `app.seed.enabled` flag (`@ConditionalOnProperty`). It creates demo users (admin + student), subjects, topics, courses, resources, discussion threads, posts, and channels. It is idempotent: it skips when the users table already has rows.

- **Local H2 quick start** — the `local` profile sets `app.seed.enabled=true` in `application-local.properties`, so demo data is loaded on every startup.
- **MySQL / dev** — start the backend with `app.seed.enabled=true` to seed the MySQL database once, then restart without the flag (or leave it on; the seeder skips when data exists):
  ```bash
  ./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --app.seed.enabled=true"
  ```

Demo credentials: `admin@example.com` / `password` and `student@example.com` / `password`.

### Production environment file

In production, provide the environment file via the systemd service (`/etc/lernchih/lernchih.env`, referenced by `lernchih.service`).

## Production Build

### Windows

```powershell
# Build frontend into backend static resources and package the JAR.
.\build.ps1

# Run from the repository root with the environment file loaded.
java -Xmx512m -jar backend\lernchih\target\lernchih-0.0.1-SNAPSHOT.jar
```

### Linux / macOS

```bash
# Build frontend into backend static resources and package the JAR.
chmod +x build.sh
./build.sh

# Run from the repository root with the environment file loaded.
java -Xmx512m -jar backend/lernchih/target/lernchih-0.0.1-SNAPSHOT.jar
```

A systemd service file is provided at `lernchih.service`. It loads `/etc/lernchih/lernchih.env` before starting the JAR.

### Optional nginx reverse proxy

The default single-port deployment runs Spring Boot embedded Tomcat directly and does not require nginx. If you need TLS termination, load balancing, or caching, see `infrastructure/nginx.conf.example` for a sample reverse-proxy configuration.

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
