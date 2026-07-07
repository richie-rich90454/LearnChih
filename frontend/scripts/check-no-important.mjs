// Lint guard: fail if src/index.css accumulates NEW !important declarations.
//
// Phase 1 lays the design-system token foundation. Phase 2 (Task 2.1) will
// remove the existing !important axe-core contrast hacks from index.css.
// Until then, this script enforces a baseline so the !important count can
// only go DOWN. When Phase 2 removes hacks, lower BASELINE to match the new
// count (ideally 0).
//
// The script strips CSS comments before counting, so the word "!important"
// mentioned inside a comment does not inflate the count.
//
// Run via: npm run lint:css  (also wired into npm run lint)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_PATH = path.resolve(__dirname, "..", "src", "index.css");

// Baseline captured at Phase 1A. This is the number of !important
// declarations in index.css after stripping comments. Composition:
//   - 4 in the global prefers-reduced-motion override (animation-duration,
//     animation-iteration-count, transition-duration, scroll-behavior).
//   - 16 in axe-core/pa11y color-contrast pins on Fluent Select, Input,
//     Label, Spinner, nav buttons, and CookieConsent text (light + dark).
// The reduced-motion override stays; Phase 2 (Task 2.1) removes the rest.
const BASELINE = 20;

function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function countImportant(css) {
    const matches = css.match(/!\s*important/gi);
    return matches ? matches.length : 0;
}

function main() {
    if (!fs.existsSync(CSS_PATH)) {
        console.error(`[lint:css] index.css not found at ${CSS_PATH}`);
        process.exit(2);
    }

    const raw = fs.readFileSync(CSS_PATH, "utf8");
    const stripped = stripComments(raw);
    const count = countImportant(stripped);

    console.log(`[lint:css] index.css !important count: ${count} (baseline: ${BASELINE})`);

    if (count > BASELINE) {
        console.error(
            `[lint:css] FAIL: ${count - BASELINE} new !important declaration(s) ` +
                "added to index.css. Do not add new !important hacks; refactor " +
                "instead. If a hack is genuinely unavoidable, remove an existing " +
                "one to keep the count <= BASELINE, or raise BASELINE here with a " +
                "justified PR comment.",
        );
        process.exit(1);
    }

    console.log("[lint:css] OK");
}

main();
