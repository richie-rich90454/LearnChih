// Audit script: find likely hardcoded user-facing strings (B91).
//
// Greps src/**/*.tsx for JSX text nodes and attributes that look like
// user-facing copy but are NOT routed through react-i18next's t() function.
// This is a lint-adjacent heuristic, not a strict gate — it reports findings
// so developers can extract remaining strings into the i18n bundles.
//
// Run via: node src/scripts/audit-hardcoded-strings.mjs
//
// Patterns flagged:
//   1. JSX text children with 3+ letters: >Some text<
//   2. placeholder="Some text" without {t(...)}
//   3. aria-label="Some text" without {t(...)}
//   4. title="Some text" without {t(...)}
//   5. label="Some text" without {t(...)} (Field/label)
//
// Heuristics to reduce false positives:
//   - Skip files in __stories__/, __tests__/, generated/, scripts/
//   - Skip strings that are clearly technical (camelCase, snake_case, URLs,
//     single words, all-caps constants, or purely numeric).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set([
    "__stories__",
    "__tests__",
    "generated",
    "scripts",
    "node_modules",
]);

const SKIP_EXTENSIONS = new Set([".css", ".json", ".mjs", ".md"]);

// A string is "likely user-facing" if it has a space or 3+ letters and is not
// clearly technical.
function looksUserFacing(str) {
    const trimmed = str.trim();
    if (trimmed.length < 3) return false;
    // Skip if it's a single camelCase / snake_case token (no spaces, no sentence).
    if (!/\s/.test(trimmed) && /^[a-z][a-zA-Z0-9_]*$/.test(trimmed)) return false;
    // Skip all-caps constants.
    if (/^[A-Z][A-Z0-9_]*$/.test(trimmed) && !/\s/.test(trimmed)) return false;
    // Skip URLs / paths.
    if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return false;
    // Skip if it looks like a key (dotted.namespace).
    if (/^[a-z]+\.[a-z.]+$/i.test(trimmed)) return false;
    return true;
}

function isAlreadyI18n(attrValue) {
    return /\bt\(|\bi18n\.|\$t\(/.test(attrValue);
}

function walk(dir, results = []) {
    let entries = [];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return results;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) walk(full, results);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (!SKIP_EXTENSIONS.has(ext)) results.push(full);
        }
    }
    return results;
}

function auditFile(filePath) {
    const src = fs.readFileSync(filePath, "utf8");
    const rel = path.relative(SRC_DIR, filePath);
    const findings = [];

    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. JSX text children: >Some text<
        const textMatches = line.matchAll(/>\s*([^<>{}]+)\s*</g);
        for (const m of textMatches) {
            const text = m[1].trim();
            if (text && looksUserFacing(text)) {
                findings.push({
                    file: rel,
                    line: i + 1,
                    type: "jsx-text",
                    text,
                });
            }
        }

        // 2-5. Attributes with literal strings (not {t(...)}).
        const attrRe =
            /\b(placeholder|aria-label|title|label)\s*=\s*"([^"]+)"/g;
        for (const m of line.matchAll(attrRe)) {
            const attr = m[1];
            const value = m[2];
            if (value && looksUserFacing(value) && !isAlreadyI18n(line)) {
                findings.push({
                    file: rel,
                    line: i + 1,
                    type: `${attr}="${value}"`,
                    text: value,
                });
            }
        }
    }

    return findings;
}

function main() {
    const files = walk(SRC_DIR);
    let total = 0;
    const byFile = new Map();

    for (const file of files) {
        const findings = auditFile(file);
        if (findings.length > 0) {
            byFile.set(file, findings);
            total += findings.length;
        }
    }

    console.log(
        `[audit] Scanned ${files.length} file(s) for hardcoded user-facing strings (B91).`,
    );
    console.log(`[audit] ${total} potential hardcoded string(s) found:\n`);

    for (const [file, findings] of byFile) {
        const rel = path.relative(SRC_DIR, file);
        console.log(`  ${rel}`);
        for (const f of findings) {
            console.log(`    ${f.line}: [${f.type}] ${f.text}`);
        }
        console.log("");
    }

    if (total === 0) {
        console.log("[audit] OK — no obvious hardcoded strings detected.");
    } else {
        console.log(
            `[audit] Review the above and extract user-facing copy into i18n bundles.`,
        );
    }
}

main();
