/**
 * LernChih brand themes for Fluent UI v9.
 *
 * These themes extend Fluent's `webLightTheme` / `webDarkTheme` by:
 *  1. Generating a full theme from a hand-tuned 16-step cobalt `BrandVariants`
 *     ramp via `createLightTheme` / `createDarkTheme`. Fluent derives every
 *     brand-tinted token (strokes, subtle backgrounds, focus rings, etc.)
 *     from this ramp.
 *  2. Pinning the exact primary brand tokens listed in the redesign spec so
 *     the cobalt accent (`#1E4FD8` light / `#5B8DEF` dark) renders verbatim
 *     on Buttons, Links, Inputs, Checkboxes, etc.
 *  3. Overriding `fontFamilyBase` / `fontFamilyMonospace` to use the
 *     self-hosted Geist fonts installed in Task 1.
 *
 * Neutral surfaces, strokes, and status colors are intentionally left to
 * Fluent's defaults — only the brand accent and font family are branded.
 */

import {
    createDarkTheme,
    createLightTheme,
    type BrandVariants,
    type Theme,
} from "@fluentui/react-components";
import { brandPalette } from "./brandTokens";

/* ------------------------------------------------------------------ */
/* Cobalt brand ramps (BrandVariants: shades 10..160)                  */
/* ------------------------------------------------------------------ */

/**
 * Cobalt ramp for light mode. Shade 80 is the primary brand color
 * `#1E4FD8` — Fluent uses shade 80 for `colorBrandBackground` in light
 * themes, so filled Buttons/Checkboxes render in the exact cobalt.
 *
 * Lower shades (10–40) are dark cobalt used for brand text on light
 * surfaces; higher shades (120–160) are pale tints used for subtle
 * brand backgrounds and hover states.
 */
const cobaltBrandLight: BrandVariants = {
    10: "#061229",
    20: "#0A1C42",
    30: "#0E2861",
    40: "#12347F",
    50: "#16409D",
    60: "#1A47D0",
    70: "#1B4AD6",
    80: "#1E4FD8",
    90: "#2B62E0",
    100: "#4A78E5",
    110: "#6E94EC",
    120: "#9AB3F2",
    130: "#BCCFF8",
    140: "#D6E1FB",
    150: "#E8EEFC",
    160: "#F3F6FE",
};

/**
 * Cobalt ramp for dark mode. Shade 80 is the lighter cobalt `#5B8DEF` —
 * Fluent uses shade 80 for `colorBrandForeground1` in dark themes, so
 * brand text/links on dark surfaces pass WCAG AA (~5.3:1 on the dark
 * neutral background). Shade 60 stays at the primary `#1E4FD8` so filled
 * brand backgrounds remain the canonical cobalt where contrast allows.
 */
const cobaltBrandDark: BrandVariants = {
    10: "#050B1A",
    20: "#0A1428",
    30: "#0F1F3D",
    40: "#142A52",
    50: "#1A3668",
    60: "#1E4FD8",
    70: "#2B62E0",
    80: "#5B8DEF",
    90: "#7BA4F4",
    100: "#9AB8F7",
    110: "#B8CCFA",
    120: "#D0DDFC",
    130: "#E0E9FD",
    140: "#EBF1FE",
    150: "#F4F8FE",
    160: "#FAFCFF",
};

/* ------------------------------------------------------------------ */
/* Shared font + brand token overrides                                 */
/* ------------------------------------------------------------------ */

/**
 * Geist font stack. Matches the `--font-sans` / `--font-mono` CSS custom
 * properties declared in `index.css` so Fluent components and raw CSS use
 * the same family.
 */
const GEIST_FONT_BASE = "Geist, system-ui, -apple-system, sans-serif";
const GEIST_FONT_MONO = "Geist Mono, ui-monospace, monospace";

/**
 * Brand token overrides for light mode. These pin the exact cobalt values
 * from the spec on top of the ramp-derived theme, guaranteeing that
 * Buttons, Links, Inputs, and compound brand accents render verbatim.
 */
const lightBrandOverrides: Partial<Theme> = {
    fontFamilyBase: GEIST_FONT_BASE,
    fontFamilyMonospace: GEIST_FONT_MONO,

    colorBrandBackground: brandPalette.cobaltLight,
    colorBrandBackgroundHover: "#1A47D0",
    colorBrandBackgroundPressed: "#16409D",
    colorBrandBackgroundSelected: brandPalette.cobaltLight,

    colorBrandForeground1: brandPalette.cobaltLight,
    colorBrandForeground2: "#2B62E0",
    colorBrandForeground2Hover: "#1A47D0",
    colorBrandForeground2Pressed: "#16409D",

    colorBrandForegroundLink: brandPalette.cobaltLight,
    colorBrandForegroundLinkHover: "#1A47D0",
    colorBrandForegroundLinkPressed: "#0E2861",
    colorBrandForegroundLinkSelected: brandPalette.cobaltLight,

    colorBrandStroke1: brandPalette.cobaltLight,
    colorBrandStroke2: "#2B62E0",

    colorCompoundBrandForeground1: brandPalette.cobaltLight,
    colorCompoundBrandForeground1Hover: "#1A47D0",
    colorCompoundBrandForeground1Pressed: "#0E2861",
};

/**
 * Brand token overrides for dark mode. Foreground / stroke / compound
 * tokens use the lighter cobalt `#5B8DEF` to pass WCAG AA on dark
 * surfaces; brand *backgrounds* keep the canonical `#1E4FD8` so filled
 * buttons stay cobalt where the surrounding dark surface provides
 * sufficient contrast.
 */
const darkBrandOverrides: Partial<Theme> = {
    fontFamilyBase: GEIST_FONT_BASE,
    fontFamilyMonospace: GEIST_FONT_MONO,

    colorBrandBackground: brandPalette.cobaltLight,
    colorBrandBackgroundHover: "#2B62E0",
    colorBrandBackgroundPressed: "#4A78E5",
    colorBrandBackgroundSelected: brandPalette.cobaltLight,

    colorBrandForeground1: brandPalette.cobaltDark,
    colorBrandForeground2: "#7BA4F4",
    colorBrandForeground2Hover: "#9AB8F7",
    colorBrandForeground2Pressed: "#B8CCFA",

    colorBrandForegroundLink: brandPalette.cobaltDark,
    colorBrandForegroundLinkHover: "#7BA4F4",
    colorBrandForegroundLinkPressed: "#9AB8F7",
    colorBrandForegroundLinkSelected: brandPalette.cobaltDark,

    colorBrandStroke1: brandPalette.cobaltDark,
    colorBrandStroke2: "#7BA4F4",

    colorCompoundBrandForeground1: brandPalette.cobaltDark,
    colorCompoundBrandForeground1Hover: "#7BA4F4",
    colorCompoundBrandForeground1Pressed: "#9AB8F7",
};

/* ------------------------------------------------------------------ */
/* Public themes                                                       */
/* ------------------------------------------------------------------ */

/**
 * Light theme for `FluentProvider`. Built by deriving a full theme from
 * the cobalt ramp, then layering the exact brand + font overrides on top.
 * Every Fluent component that consumes `colorBrandBackground` etc. will
 * render in cobalt instead of Fluent's default blue.
 */
export const brandLightTheme: Theme = {
    ...createLightTheme(cobaltBrandLight),
    ...lightBrandOverrides,
};

/**
 * Dark theme for `FluentProvider`. Uses the cobalt dark ramp so brand
 * text/strokes use the lighter `#5B8DEF` for contrast, while brand
 * backgrounds remain the canonical `#1E4FD8` cobalt.
 */
export const brandDarkTheme: Theme = {
    ...createDarkTheme(cobaltBrandDark),
    ...darkBrandOverrides,
};
