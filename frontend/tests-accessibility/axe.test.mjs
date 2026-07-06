import { startPreviewServer, stopServer } from "./lib/server.mjs";
import puppeteer from "puppeteer";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const PAGES = ["/", "/login", "/register", "/forgot-password", "/resources"];

const axeSource = readFileSync(
    path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "node_modules",
        "axe-core",
        "axe.min.js",
    ),
    "utf8",
);

async function run() {
    const server = await startPreviewServer(PORT);
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    let hasCriticalOrSerious = false;

    try {
        for (const route of PAGES) {
            const page = await browser.newPage();
            // Use `domcontentloaded` instead of `networkidle0` so the test
            // can run without the backend. `networkidle0` waits for 500ms of
            // zero network activity, which never happens when React Query
            // retries failed API calls (ECONNREFUSED) every few hundred ms.
            await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
            // Give React + Motion + GSAP enough time to mount and paint the
            // initial frame before axe walks the DOM. 1500ms comfortably
            // covers the longest entry choreography (hero stagger ~720ms)
            // and lets React Query settle into its loading/error state.
            await page.waitForFunction(
                () => document.querySelector("#root")?.children.length > 0,
                { timeout: 10000 },
            );
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await page.evaluate(axeSource);

            const results = await page.evaluate(() => {
                return new Promise((resolve, reject) => {
                    // @ts-ignore
                    window.axe.run((err, res) => {
                        if (err) reject(err);
                        else resolve(res);
                    });
                });
            });

            console.log(`\naxe-core results for ${route}:`);
            console.log(`  ${results.violations.length} violation(s)`);
            for (const violation of results.violations) {
                console.log(
                    `  [${violation.impact}] ${violation.help} (${violation.nodes.length} node(s))`,
                );
                for (const node of violation.nodes) {
                    console.log(`    target: ${JSON.stringify(node.target)}`);
                    console.log(`    html: ${node.html.slice(0, 200)}`);
                }
                if (violation.impact === "critical" || violation.impact === "serious") {
                    hasCriticalOrSerious = true;
                }
            }

            await page.close();
        }
    } finally {
        await browser.close();
        await stopServer(server);
    }

    if (hasCriticalOrSerious) {
        throw new Error(" axe-core detected critical or serious accessibility violations");
    }
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
