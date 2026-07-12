// Audit script: find negative tabIndex on focusable elements (B98).
//
// Greps src/**/*.tsx for tabIndex={-1} and tabIndex="-1" on elements that are
// natively focusable (a, button, input, select, textarea, area, summary, and
// elements with role="button"/"link"/"tab"/"checkbox" etc.). A negative
// tabIndex removes an element from the tab order, which can trap keyboard
// users if applied incorrectly (e.g. on a primary action button).
//
// This is a heuristic — some negative tabIndex uses are intentional (e.g. the
// skip-link target `#main-content`, or programmatically-focusable utility
// elements). The script reports all occurrences so they can be reviewed.
//
// Run via: node src/scripts/audit-tab-order.mjs

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

// Elements that are natively focusable; a negative tabIndex on these is most
// likely to cause a tab-order regression.
const FOCUSABLE_TAGS = new Set([
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "area",
    "summary",
    "details",
]);

const FOCUSABLE_ROLES = new Set([
    "button",
    "link",
    "tab",
    "checkbox",
    "radio",
    "slider",
    "spinbutton",
    "combobox",
    "option",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "switch",
    "treeitem",
    "gridcell",
]);

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

        // Match tabIndex={-1} or tabIndex="-1".
        const tabMatch = line.match(/tabIndex\s*=\s*[\{"]\s*(-?\d+)\s*[\}"]/);
        if (!tabMatch) continue;
        const value = parseInt(tabMatch[1], 10);
        if (value >= 0) continue;

        // Check if this line contains a focusable tag or role.
        const tagMatch = line.match(/^\s*<(\w+)/);
        const tag = tagMatch ? tagMatch[1].toLowerCase() : "";
        const roleMatch = line.match(/\brole\s*=\s*[\{"]([^"}]+)[\}"]/);
        const role = roleMatch ? roleMatch[1].toLowerCase().trim() : "";

        const isFocusable =
            FOCUSABLE_TAGS.has(tag) || FOCUSABLE_ROLES.has(role);

        findings.push({
            file: rel,
            line: i + 1,
            tag: tag || "(unknown)",
            role: role || "",
            focusable: isFocusable,
            code: line.trim(),
        });
    }

    return findings;
}

function main() {
    const files = walk(SRC_DIR);
    let total = 0;
    const focusableHits = [];

    for (const file of files) {
        const findings = auditFile(file);
        for (const f of findings) {
            total++;
            if (f.focusable) focusableHits.push(f);
        }
    }

    console.log(
        `[audit] Scanned ${files.length} file(s) for negative tabIndex (B98).`,
    );
    console.log(`[audit] ${total} negative tabIndex occurrence(s) found.`);
    console.log(
        `[audit] ${focusableHits.length} on natively-focusable elements (review these):\n`,
    );

    for (const f of focusableHits) {
        const roleStr = f.role ? ` role="${f.role}"` : "";
        console.log(`  ${f.file}:${f.line}  <${f.tag}${roleStr}>`);
        console.log(`    ${f.code}`);
        console.log("");
    }

    if (focusableHits.length === 0) {
        console.log("[audit] OK — no negative tabIndex on focusable elements.");
    } else {
        console.log(
            `[audit] Review the above: negative tabIndex on focusable elements removes them from the tab order.`,
        );
    }
}

main();
