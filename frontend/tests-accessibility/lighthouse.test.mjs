import { startPreviewServer, stopServer } from "./lib/server.mjs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const PORT = 4173;
const URL = `http://localhost:${PORT}/`;

async function run() {
    const server = await startPreviewServer(PORT);
    let chrome;

    try {
        chrome = await chromeLauncher.launch({
            chromeFlags: ["--headless", "--no-sandbox", "--disable-setuid-sandbox"],
            chromePath: puppeteer.executablePath(),
        });

        const runnerResult = await lighthouse(URL, {
            port: chrome.port,
            output: ["html", "json"],
            logLevel: "error",
        });

        const reportHtml = Array.isArray(runnerResult.report)
            ? runnerResult.report[0]
            : runnerResult.report;

        const outDir = path.join(process.cwd(), "tests-accessibility");
        fs.writeFileSync(path.join(outDir, "lighthouse-report.html"), reportHtml);
        fs.writeFileSync(
            path.join(outDir, "lighthouse-report.json"),
            JSON.stringify(runnerResult.lhr, null, 2),
        );

        console.log("Lighthouse scores:");
        for (const [key, category] of Object.entries(runnerResult.lhr.categories)) {
            const score = category.score === null ? "n/a" : Math.round(category.score * 100);
            console.log(`  ${category.title} (${key}): ${score}`);
        }
    } finally {
        if (chrome) await chrome.kill();
        await stopServer(server);
    }
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
