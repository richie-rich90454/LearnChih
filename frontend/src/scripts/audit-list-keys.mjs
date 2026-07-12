// Audit script (B33): report list `key` props that use the array index.
//
// Using `key={index}` is a common source of subtle bugs: when list items are
// reordered, inserted, or deleted, React reuses the wrong DOM nodes because
// the index-based key still matches a different item. This breaks stateful
// children (inputs, animations) and can cause accessible-name mismatches.
//
// This script scans every .ts/.tsx file under src/ for `key={index}` (and the
// common `key={i}` / `key={idx}` variants) and prints each occurrence with its
// file and line number. It exits non-zero only when explicitly wired into CI;
// by default it is advisory and exits 0 so it can be run as a one-off audit.
//
// Run via: node src/scripts/audit-list-keys.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "..");

// Match `key={index}`, `key={i}`, `key={idx}`, `key={key}` style index props.
// We look for the literal `key={` followed by a short identifier that looks
// like an index variable, then a closing `}`.
const KEY_INDEX_REGEX = /\bkey=\{\s*(i|idx|index|key|j|k)\s*\}/g;

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

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
        // Strip line comments so a `// key={index}` example in a comment is
        // still reported but clearly attributable to documentation.
        const matches = [...line.matchAll(KEY_INDEX_REGEX)];
        for (const m of matches) {
            findings.push({
                file: path.relative(SRC_DIR, filePath),
                line: i + 1,
                snippet: line.trim(),
                matched: m[0],
            });
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
                `[audit-list-keys] ${f.file}:${f.line}  ${f.matched}  ->  ${f.snippet}`,
            );
        }
    }
    console.log(
        `[audit-list-keys] scanned ${files.length} files, found ${total} index-based key(s).`,
    );
    // Advisory: always exit 0. Promote to a blocking check by changing this
    // to `process.exit(total > 0 ? 1 : 0)` once remaining instances are fixed.
    process.exit(0);
}

main();
