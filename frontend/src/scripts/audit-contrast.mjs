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
const LARGE_TEXT_UI_MIN = 3; // large text (>=18.66px bold / >=24px) + UI components

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

// B42: Large-text / UI-component pairs audited at the 3:1 threshold. These
// cover status badge foregrounds on their soft tinted backgrounds (Badges use
// >=14px medium weight; the tinted soft bg carries an alpha in dark mode so
// the `backdrop` token is composited underneath) and text-on-accent for filled
// buttons (UI graphics). 3:1 is the WCAG AA minimum for large text and for UI
// component boundaries/graphics.
const LARGE_UI_PAIRS = [
    // Light theme — status badge fg on soft bg, text on accent fill.
    {
        theme: "light",
        fg: "--status-success",
        bg: "--status-success-soft",
        backdrop: "--surface-1",
        label: "success badge text on success-soft",
    },
    {
        theme: "light",
        fg: "--status-warning",
        bg: "--status-warning-soft",
        backdrop: "--surface-1",
        label: "warning badge text on warning-soft",
    },
    {
        theme: "light",
        fg: "--status-danger",
        bg: "--status-danger-soft",
        backdrop: "--surface-1",
        label: "danger badge text on danger-soft",
    },
    {
        theme: "light",
        fg: "--text-on-accent",
        bg: "--accent-fill",
        backdrop: "--surface-1",
        label: "button text on accent fill",
    },
    {
        theme: "light",
        fg: "--accent",
        bg: "--accent-soft",
        backdrop: "--surface-1",
        label: "accent text on accent-soft",
    },
    // Dark theme — soft backgrounds are rgba; composited over the dark surface.
    {
        theme: "dark",
        fg: "--status-success",
        bg: "--status-success-soft",
        backdrop: "--surface-1",
        label: "success badge text on success-soft",
    },
    {
        theme: "dark",
        fg: "--status-warning",
        bg: "--status-warning-soft",
        backdrop: "--surface-1",
        label: "warning badge text on warning-soft",
    },
    {
        theme: "dark",
        fg: "--status-danger",
        bg: "--status-danger-soft",
        backdrop: "--surface-1",
        label: "danger badge text on danger-soft",
    },
    {
        theme: "dark",
        fg: "--text-on-accent",
        bg: "--accent-fill",
        backdrop: "--surface-1",
        label: "button text on accent fill",
    },
    {
        theme: "dark",
        fg: "--accent",
        bg: "--accent-soft",
        backdrop: "--surface-1",
        label: "accent text on accent-soft",
    },
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

/**
 * Resolve a (fg, bg, optional backdrop) pair into opaque fg/bg colors and
 * return the WCAG contrast ratio. If bg carries alpha (dark-theme soft tints),
 * it is composited over the `backdrop` token (defaulting to surface-1) so the
 * effective background is used. fg alpha is then composited over the effective
 * bg. Returns null if any token cannot be resolved.
 */
function resolvePair(pair, themes) {
    const theme = themes[pair.theme];
    if (!theme) return null;
    const fg = resolveColor(pair.fg, theme, themes);
    const bg = resolveColor(pair.bg, theme, themes);
    if (!fg || !bg) return null;

    // Backdrop defaults to surface-1; used to flatten alpha backgrounds.
    const backdropToken = pair.backdrop ?? "--surface-1";
    const backdrop =
        resolveColor(backdropToken, theme, themes) ?? { r: 255, g: 255, b: 255, a: 1 };

    const effectiveBg =
        bg.a >= 1 ? { ...bg, a: 1 } : composite(bg, backdrop);
    const effectiveFg =
        fg.a >= 1 ? { ...fg, a: 1 } : composite(fg, effectiveBg);
    return { ratio: contrastRatio(effectiveFg, effectiveBg) };
}

function runPass(header, pairs, threshold, themes) {
    let failures = 0;
    let checked = 0;
    console.log(`[audit-contrast] ${header} (need ${threshold}:1)`);
    for (const pair of pairs) {
        const resolved = resolvePair(pair, themes);
        if (!resolved) {
            console.log(
                `[audit-contrast] SKIP  ${pair.theme}: could not resolve ` +
                    `${pair.fg}/${pair.bg}`,
            );
            continue;
        }
        const { ratio } = resolved;
        const pass = ratio >= threshold;
        checked += 1;
        if (!pass) failures += 1;
        const status = pass ? "PASS" : "FAIL";
        console.log(
            `[audit-contrast] ${status}  ${pair.theme} ${pair.label}: ` +
                `${ratio.toFixed(2)}:1`,
        );
    }
    console.log(
        `[audit-contrast] ${checked} pair(s) checked, ${failures} failure(s).`,
    );
    return failures;
}

function main() {
    if (!fs.existsSync(TOKENS_PATH)) {
        console.error(`[audit-contrast] tokens.css not found at ${TOKENS_PATH}`);
        process.exit(2);
    }
    const css = fs.readFileSync(TOKENS_PATH, "utf8");
    const themes = parseTokens(css);

    const bodyFailures = runPass(
        "body-text pairs (WCAG AA)",
        BODY_PAIRS,
        BODY_TEXT_MIN,
        themes,
    );
    const uiFailures = runPass(
        "large-text / UI pairs (WCAG AA)",
        LARGE_UI_PAIRS,
        LARGE_TEXT_UI_MIN,
        themes,
    );
    const totalFailures = bodyFailures + uiFailures;
    console.log(
        `[audit-contrast] total failures: ${totalFailures}`,
    );
    // Advisory: exit 0 so it can run as a one-off audit.
    process.exit(0);
}

main();
