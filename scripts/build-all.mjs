#!/usr/bin/env node
/**
 * Cross-platform build script for LernChih.
 *
 * Replaces build.sh / build.ps1. Pure Node.js, works on Windows and Unix.
 *
 * Steps:
 *   1. Build the frontend (vite build)
 *   2. Copy frontend/dist into backend static resources
 *   3. Build the backend (mvnw clean package -DskipTests)
 *
 * Usage:  node scripts/build-all.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, rmSync, cpSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const FRONTEND_DIR = join(REPO_ROOT, "frontend");
const BACKEND_DIR = join(REPO_ROOT, "backend", "lernchih");
const STATIC_DIR = join(BACKEND_DIR, "src", "main", "resources", "static");
const DIST_DIR = join(FRONTEND_DIR, "dist");

const isWindows = platform() === "win32";

function run(cmd, args, cwd, label) {
    console.log(`\n[build] ${label}: ${cmd} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd,
            stdio: "inherit",
            shell: isWindows,
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`[build] ${label} failed with exit code ${code}`));
        });
    });
}

async function main() {
    // Step 1: Build frontend
    console.log("[build] Step 1/3: Building frontend...");
    await run("npm", ["install"], FRONTEND_DIR, "npm install (frontend)");
    await run("npm", ["run", "build"], FRONTEND_DIR, "vite build");

    if (!existsSync(DIST_DIR)) {
        throw new Error(`[build] Frontend dist not found at ${DIST_DIR}`);
    }

    // Step 2: Copy dist to backend static resources
    console.log("\n[build] Step 2/3: Copying frontend dist to backend static resources...");
    if (existsSync(STATIC_DIR)) {
        rmSync(STATIC_DIR, { recursive: true, force: true });
    }
    mkdirSync(STATIC_DIR, { recursive: true });
    cpSync(DIST_DIR, STATIC_DIR, { recursive: true });
    console.log(`[build] Copied ${DIST_DIR} -> ${STATIC_DIR}`);

    // Step 3: Build backend
    console.log("\n[build] Step 3/3: Building backend (Maven)...");
    const mvnw = isWindows ? "mvnw.cmd" : "mvnw";
    const mvnwPath = join(BACKEND_DIR, mvnw);
    await run(mvnwPath, ["clean", "package", "-DskipTests"], BACKEND_DIR, "mvn package");

    console.log("\n[build] All builds complete!");
    console.log("[build] Run the app with:  npm start");
    console.log("[build]   (serves backend on port 38517 with bundled frontend)");
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
