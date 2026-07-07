#!/usr/bin/env node
/**
 * Cross-platform backend starter for LernChih.
 *
 * Replaces start-local.sh / serve-local.sh / build.ps1 backend step.
 * Works on Windows (PowerShell + cmd) and Unix (bash, zsh) without any
 * shell scripts — pure Node.js, no external dependencies.
 *
 * Usage:  node scripts/dev-backend.mjs
 *
 * Loads .env from the repo root, sets required environment variables,
 * then starts the Spring Boot backend with the local profile (H2 in-memory).
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const BACKEND_DIR = join(REPO_ROOT, "backend", "lernchih");
const ENV_FILE = join(REPO_ROOT, ".env");

/**
 * Parse a .env file and set variables on process.env.
 * Only sets variables that aren't already defined in the environment
 * (real environment variables take precedence over .env defaults).
 */
function loadEnv(filePath) {
    if (!existsSync(filePath)) {
        console.warn(`[dev-backend] No .env file found at ${filePath}`);
        return;
    }
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

loadEnv(ENV_FILE);

// Ensure JWT_SECRET is set (required by the backend).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.warn(
        "[dev-backend] JWT_SECRET is missing or too short (<32 chars). Using dev default.",
    );
    process.env.JWT_SECRET = "local-dev-jwt-secret-must-be-at-least-32-characters-long";
}

// Use H2 in-memory for local dev if not already configured.
if (!process.env.DB_URL) {
    process.env.DB_URL = "jdbc:h2:mem:lernchih;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
}

const isWindows = platform() === "win32";
const mvnw = isWindows ? "mvnw.cmd" : "mvnw";
const mvnwPath = join(BACKEND_DIR, mvnw);

console.log("[dev-backend] Starting Spring Boot backend (local profile)...");
console.log(`[dev-backend] Backend dir: ${BACKEND_DIR}`);
console.log(`[dev-backend] Maven wrapper: ${mvnw}`);
console.log(`[dev-backend] Server port: ${process.env.SERVER_PORT || 38517}`);

const args = [
    "spring-boot:run",
    `-Dspring-boot.run.arguments=--spring.profiles.active=local`,
];

const child = spawn(mvnwPath, args, {
    cwd: BACKEND_DIR,
    stdio: "inherit",
    shell: isWindows, // Needed on Windows to find .cmd files
    env: { ...process.env },
});

child.on("error", (err) => {
    console.error("[dev-backend] Failed to start backend:", err.message);
    if (err.code === "ENOENT") {
        console.error(
            `[dev-backend] Maven wrapper not found at ${mvnwPath}. Ensure the backend submodule is initialized.`,
        );
    }
    process.exit(1);
});

child.on("exit", (code) => {
    process.exit(code ?? 1);
});

// Forward Ctrl+C / SIGTERM to the child process.
process.on("SIGINT", () => {
    child.kill("SIGINT");
});
process.on("SIGTERM", () => {
    child.kill("SIGTERM");
});
