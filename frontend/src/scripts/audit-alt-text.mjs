// Audit script (B38): report <img> tags that are missing an `alt` attribute.
//
// WCAG 1.1.1 requires every <img> to have an `alt` attribute. Decorative
// images may use alt="" (empty) to be ignored by assistive tech, but the
// attribute must still be present. This script scans .ts/.tsx/.js/.jsx files
// under src/ for `<img` tags and flags any that lack `alt`.
//
// It is a simple regex-based scanner (not a full JSX parser) so it may produce
// false positives for spread props or multi-line tags; each finding is printed
// with file:line for manual review. Advisory only — exits 0.
//
// Run via: node src/scripts/audit-alt-text.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "..");

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

// Match an <img ...> tag (self-closing or with attributes) up to the next `>`.
// We capture the full tag text so we can inspect it for an `alt` attribute.
const IMG_TAG_REGEX = /<img\b[^>]*?\/?>/gi;

function walk(dir, results = []) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return results;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === "dist") continue;
            walk(full, results);
        } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
            results.push(full);
        }
    }
    return results;
}

function hasAlt(tagText) {
    // `alt` may appear as alt="...", alt={'...'}, alt={alt}, or alt (boolean).
    // Match `alt` as a word boundary followed by `=` or whitespace/> end.
    return /\balt\b\s*(?:=|\s|\/?>)/i.test(tagText);
}

function scanFile(filePath) {
    const findings = [];
    let text;
    try {
        text = fs.readFileSync(filePath, "utf8");
    } catch {
        return findings;
    }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const matches = [...line.matchAll(IMG_TAG_REGEX)];
        for (const m of matches) {
            const tag = m[0];
            if (!hasAlt(tag)) {
                findings.push({
                    file: path.relative(SRC_DIR, filePath),
                    line: i + 1,
                    snippet: line.trim(),
                    tag,
                });
            }
        }
    }
    return findings;
}

function main() {
    const files = walk(SRC_DIR);
    let total = 0;
    for (const file of files) {
        const findings = scanFile(file);
        for (const f of findings) {
            total += 1;
            console.warn(
                `[audit-alt-text] ${f.file}:${f.line}  missing alt  ->  ${f.snippet}`,
            );
        }
    }
    console.log(
        `[audit-alt-text] scanned ${files.length} files, found ${total} img tag(s) without alt.`,
    );
    // Advisory: exit 0. Make blocking by changing to
    // `process.exit(total > 0 ? 1 : 0)` once remaining issues are fixed.
    process.exit(0);
}

main();
