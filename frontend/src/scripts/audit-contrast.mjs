// Audit script (B41): verify design-system token color pairs meet WCAG AA
// contrast thresholds for BODY text (4.5:1).
//
// The semantic color pairs (foreground on background) defined in
// src/design-system/tokens.css are the canonical text/background
// combinations used across the app. This script parses those hex values and
// computes the WCAG 2.1 contrast ratio for each known pair, flagging any that
// fall below the 4.5:1 minimum required for normal-size body text.
//
// Alpha (rgba) backgrounds are composited over the relevant surface so the
// effective color is used. The script reads tokens.css directly so it always
// reflects the current token values.
//
// Run via: node src/scripts/audit-contrast.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.resolve(
    __dirname,
    "..",
    "design-system",
    "tokens.css",
);

// WCAG AA thresholds.
const BODY_TEXT_MIN = 4.5; // normal text

// Pairs to audit. Each entry lists the foreground token, the background token
// it is rendered on, and the theme block to read the values from. Only
// BODY-text pairs (primary/secondary/accent text on surfaces) are checked
// here at the 4.5:1 threshold. Large-text/UI pairs (3:1) are added in B42.
const BODY_PAIRS = [
    // Light theme
    { theme: "light", fg: "--text-primary", bg: "--surface-1", label: "primary text on app bg" },
    { theme: "light", fg: "--text-secondary", bg: "--surface-1", label: "secondary text on app bg" },
    { theme: "light", fg: "--text-primary", bg: "--surface-2", label: "primary text on card" },
    { theme: "light", fg: "--text-secondary", bg: "--surface-2", label: "secondary text on card" },
    { theme: "light", fg: "--accent", bg: "--surface-1", label: "accent link on app bg" },
    { theme: "light", fg: "--accent", bg: "--surface-2", label: "accent link on card" },
    // Dark theme
    { theme: "dark", fg: "--text-primary", bg: "--surface-1", label: "primary text on app bg" },
    { theme: "dark", fg: "--text-secondary", bg: "--surface-1", label: "secondary text on app bg" },
    { theme: "dark", fg: "--text-primary", bg: "--surface-2", label: "primary text on card" },
    { theme: "dark", fg: "--text-secondary", bg: "--surface-2", label: "secondary text on card" },
    { theme: "dark", fg: "--accent", bg: "--surface-1", label: "accent link on app bg" },
    { theme: "dark", fg: "--accent", bg: "--surface-2", label: "accent link on card" },
];

/**
 * Parse a CSS color string into {r, g, b, a}. Supports #hex, #hexhh (8-digit
 * hex alpha), and rgba()/rgb(). Returns null for unparseable input.
 */
function parseColor(raw) {
    const s = raw.trim().toLowerCase();
    let m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
    if (m) {
        const r = parseInt(m[1].slice(0, 2), 16);
        const g = parseInt(m[1].slice(2, 4), 16);
        const b = parseInt(m[1].slice(4, 6), 16);
        const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
        return { r, g, b, a };
    }
    m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/);
    if (m) {
        return {
            r: parseFloat(m[1]),
            g: parseFloat(m[2]),
            b: parseFloat(m[3]),
            a: m[4] !== undefined ? parseFloat(m[4]) : 1,
        };
    }
    return null;
}

/** Composite an rgba color over an opaque backdrop, returning {r,g,b,a:1}. */
function composite(fg, bg) {
    if (fg.a >= 1) return { ...fg, a: 1 };
    const a = fg.a;
    return {
        r: Math.round(fg.r * a + bg.r * (1 - a)),
        g: Math.round(fg.g * a + bg.g * (1 - a)),
        b: Math.round(fg.b * a + bg.b * (1 - a)),
        a: 1,
    };
}

/** WCAG relative luminance for an sRGB channel value 0-255. */
function channelLuminance(c8) {
    const c = c8 / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(color) {
    return (
        0.2126 * channelLuminance(color.r) +
        0.7152 * channelLuminance(color.g) +
        0.0722 * channelLuminance(color.b)
    );
}

function contrastRatio(fg, bg) {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse tokens.css into theme -> { tokenName: colorString }. Each theme is a
 * block: the bare :root (light), and the [data-theme="dark"] block for dark.
 * (We use the explicit [data-theme] blocks rather than the
 * prefers-color-scheme media query so manual toggle values are audited.)
 */
function parseTokens(css) {
    const themes = { light: {}, dark: {} };

    // Capture the first bare `:root { ... }` block (light defaults).
    const rootMatch = css.match(/^:root\s*\{([^}]*)\}/m);
    if (rootMatch) collectVars(rootMatch[1], themes.light);

    // Capture `:root[data-theme="light"] { ... }` and `:root[data-theme="dark"] { ... }`.
    const attrRegex = /:root\[data-theme="(light|dark)"\]\s*\{([^}]*)\}/g;
    let am;
    while ((am = attrRegex.exec(css)) !== null) {
        collectVars(am[2], themes[am[1]]);
    }
    return themes;
}

function collectVars(blockText, target) {
    const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let vm;
    while ((vm = varRegex.exec(blockText)) !== null) {
        target[vm[1].trim()] = vm[2].trim();
    }
}

function resolveColor(tokenName, theme, themes) {
    const raw = theme[tokenName];
    if (!raw) return null;
    // Resolve var() references (single hop, e.g. --accent: var(--brand-cobalt)).
    const varRef = raw.match(/var\(\s*(--[\w-]+)/);
    if (varRef) {
        return resolveColor(varRef[1], theme, themes);
    }
    return parseColor(raw);
}

function main() {
    if (!fs.existsSync(TOKENS_PATH)) {
        console.error(`[audit-contrast] tokens.css not found at ${TOKENS_PATH}`);
        process.exit(2);
    }
    const css = fs.readFileSync(TOKENS_PATH, "utf8");
    const themes = parseTokens(css);

    let failures = 0;
    let checked = 0;
    console.log("[audit-contrast] body-text pairs (WCAG AA 4.5:1)");
    for (const pair of BODY_PAIRS) {
        const theme = themes[pair.theme];
        if (!theme) {
            console.log(`[audit-contrast] unknown theme: ${pair.theme}`);
            continue;
        }
        let fg = resolveColor(pair.fg, theme, themes);
        let bg = resolveColor(pair.bg, theme, themes);
        if (!fg || !bg) {
            console.log(
                `[audit-contrast] ${pair.theme}: could not resolve ` +
                    `${pair.fg}/${pair.bg}`,
            );
            continue;
        }
        // Composite any alpha onto the surface so the effective color is used.
        fg = composite(fg, bg);
        bg = composite(bg, { r: 0, g: 0, b: 0, a: 1 });

        const ratio = contrastRatio(fg, bg);
        const pass = ratio >= BODY_TEXT_MIN;
        checked += 1;
        if (!pass) failures += 1;
        const status = pass ? "PASS" : "FAIL";
        console.log(
            `[audit-contrast] ${status}  ${pair.theme} ${pair.label}: ` +
                `${ratio.toFixed(2)}:1 (need ${BODY_TEXT_MIN})`,
        );
    }
    console.log(
        `[audit-contrast] checked ${checked} body-text pair(s), ${failures} failure(s).`,
    );
    // Advisory: exit 0 so it can run as a one-off audit.
    process.exit(0);
}

main();
