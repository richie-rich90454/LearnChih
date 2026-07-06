// Diagnostic script: checks computed color/background for elements that
// axe-core reports as failing color-contrast. Run after `npm run build`
// and while `vite preview` is running on port 4173.
import puppeteer from "puppeteer";

const BASE = "http://localhost:4173";

async function diagnose() {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.goto(`${BASE}/resources`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(
            () => document.querySelector("#root")?.children.length > 0,
            { timeout: 10000 },
        );
        await new Promise((r) => setTimeout(r, 2000));

        const results = await page.evaluate(() => {
            const out = [];
            // Check Select elements
            document.querySelectorAll(".fui-Select__select").forEach((el) => {
                const cs = window.getComputedStyle(el);
                out.push({
                    tag: el.tagName,
                    id: el.id,
                    classes: el.className,
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    parentBg: window.getComputedStyle(el.parentElement).backgroundColor,
                });
            });
            // Check Label elements
            document.querySelectorAll(".fui-Label").forEach((el) => {
                const cs = window.getComputedStyle(el);
                out.push({
                    tag: el.tagName,
                    id: el.id,
                    classes: el.className,
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    parentBg: window.getComputedStyle(el.parentElement).backgroundColor,
                });
            });
            // Check Spinner label
            document.querySelectorAll(".fui-Spinner__label").forEach((el) => {
                const cs = window.getComputedStyle(el);
                out.push({
                    tag: el.tagName,
                    id: el.id,
                    classes: el.className,
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    parentBg: window.getComputedStyle(el.parentElement).backgroundColor,
                });
            });
            // Check nav button text
            document.querySelectorAll("nav .fui-Button .fui-Text").forEach((el) => {
                const cs = window.getComputedStyle(el);
                out.push({
                    tag: el.tagName,
                    text: el.textContent,
                    classes: el.className,
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    parentBg: window.getComputedStyle(el.parentElement).backgroundColor,
                    grandparentBg: window.getComputedStyle(el.parentElement?.parentElement).backgroundColor,
                });
            });
            // Check landing page hero elements
            document.querySelectorAll("h1, h2, .fui-Subtitle1, .fui-Subtitle2").forEach((el) => {
                const cs = window.getComputedStyle(el);
                out.push({
                    tag: el.tagName,
                    text: el.textContent?.slice(0, 40),
                    classes: el.className.slice(0, 80),
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    parentBg: window.getComputedStyle(el.parentElement).backgroundColor,
                });
            });
            return out;
        });

        console.log(JSON.stringify(results, null, 2));
    } finally {
        await browser.close();
    }
}

diagnose().catch(console.error);
