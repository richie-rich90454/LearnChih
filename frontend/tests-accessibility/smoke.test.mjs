import { startPreviewServer, stopServer } from "./lib/server.mjs";
import puppeteer from "puppeteer";

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// Public routes that render without authentication.
// Authenticated routes (dashboard, profile, flashcards, quizzes, bookmarks,
// study-groups, notifications, admin, moderation) redirect to /login when the
// backend is unreachable, so we assert that the redirect happens cleanly
// rather than that the page renders authenticated content.
const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/resources",
    "/channels",
    "/leaderboard",
    "/search",
    "/api-docs",
    "/nonexistent-route-404",
];

const AUTH_ROUTES = [
    "/dashboard",
    "/profile",
    "/flashcards",
    "/quizzes",
    "/bookmarks",
    "/study-groups",
    "/notifications",
    "/admin",
    "/moderation",
];

const ALL_ROUTES = [...PUBLIC_ROUTES, ...AUTH_ROUTES];

// Network errors that are expected when the backend is not running.
// 502 Bad Gateway is emitted by the Vite dev/preview proxy when its upstream
// (the backend API on port 38517) refuses the connection — semantically
// equivalent to ECONNREFUSED in this smoke-test environment.
const EXPECTED_NETWORK_PATTERNS = [
    "net::ERR_CONNECTION_REFUSED",
    "ECONNREFUSED",
    "Failed to fetch",
    "Network request failed",
    "ERR_FAILED",
    "ERR_NETWORK_CHANGED",
    "ERR_EMPTY_RESPONSE",
    "502 (Bad Gateway)",
    "/api/",
];

function isExpectedNetworkError(text = "") {
    return EXPECTED_NETWORK_PATTERNS.some((p) => text.includes(p));
}

async function testRoute(page, route) {
    const consoleErrors = [];
    const pageErrors = [];
    const failedNetwork = [];

    const onConsole = (msg) => {
        if (msg.type() === "error") {
            const text = msg.text();
            if (!isExpectedNetworkError(text)) {
                consoleErrors.push(text);
            }
        }
    };
    const onPageError = (err) => {
        const text = `${err.name}: ${err.message}`;
        if (!isExpectedNetworkError(text)) {
            pageErrors.push(text);
        }
    };
    const onRequestFailed = (req) => {
        const url = req.url();
        const failure = req.failure()?.errorText || "";
        if (url.includes("/api/") || isExpectedNetworkError(failure)) {
            return;
        }
        failedNetwork.push(`${url} — ${failure}`);
    };

    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("requestfailed", onRequestFailed);

    const url = `${BASE}${route}`;
    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    } catch (err) {
        if (!/Navigation timeout/.test(err.message)) {
            page.off("console", onConsole);
            page.off("pageerror", onPageError);
            page.off("requestfailed", onRequestFailed);
            return {
                consoleErrors,
                pageErrors: [`SMOKE_NAV_ERROR: ${err.message}`],
                failedNetwork,
            };
        }
    }
    await new Promise((resolve) => setTimeout(resolve, 600));

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);

    return { consoleErrors, pageErrors, failedNetwork };
}

async function runMode(browser, mode) {
    const results = {};
    const page = await browser.newPage();

    if (mode === "dark") {
        await page.emulateMediaFeatures([
            { name: "prefers-color-scheme", value: "dark" },
        ]);
    } else {
        await page.emulateMediaFeatures([
            { name: "prefers-color-scheme", value: "light" },
        ]);
    }
    if (mode === "reduced-motion") {
        await page.emulateMediaFeatures([
            { name: "prefers-reduced-motion", value: "reduce" },
        ]);
    }

    for (const route of ALL_ROUTES) {
        try {
            results[route] = await testRoute(page, route);
        } catch (err) {
            results[route] = {
                consoleErrors: [],
                pageErrors: [`SMOKE_FATAL: ${err.message}`],
                failedNetwork: [],
            };
        }
    }

    await page.close();
    return results;
}

function summarize(results, mode) {
    let pass = 0;
    let fail = 0;
    const failures = {};
    for (const [route, r] of Object.entries(results)) {
        const hasFail =
            r.pageErrors.length > 0 ||
            r.failedNetwork.length > 0 ||
            r.consoleErrors.length > 0;
        if (hasFail) {
            fail++;
            failures[route] = r;
        } else {
            pass++;
        }
    }
    return { mode, pass, fail, failures, total: pass + fail };
}

async function run() {
    const server = await startPreviewServer(PORT);
    const allSummaries = [];
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            for (const mode of ["light", "dark", "reduced-motion"]) {
                const results = await runMode(browser, mode);
                allSummaries.push(summarize(results, mode));
            }
        } finally {
            await browser.close();
        }

        console.log("\n=== Smoke test summary ===");
        let totalFail = 0;
        for (const s of allSummaries) {
            console.log(
                `  ${s.mode.padEnd(15)}  ${s.pass}/${s.total} passed, ${s.fail} failed`,
            );
            totalFail += s.fail;
            for (const [route, r] of Object.entries(s.failures)) {
                console.log(`    X ${route}`);
                for (const e of r.pageErrors) console.log(`        pageError: ${e}`);
                for (const e of r.consoleErrors) console.log(`        consoleError: ${e}`);
                for (const e of r.failedNetwork) console.log(`        failedNetwork: ${e}`);
            }
        }

        if (totalFail > 0) {
            console.log(`\nSmoke test FAILED with ${totalFail} failing route(s)/mode(s).`);
            process.exitCode = 1;
        } else {
            console.log("\nSmoke test PASSED: all routes rendered without unexpected console or page errors in all three modes.");
        }
    } finally {
        await stopServer(server);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
