/**
 * LernChih brand design tokens.
 *
 * These tokens are the single source of truth for the brand's visual identity:
 * the cobalt + cream palette, corner radii, motion timings, and tinted
 * shadows. They are layered on top of Fluent UI v9's theme in `brandTheme.ts`
 * and mirrored as CSS custom properties in `index.css` (Task 1).
 *
 * Only the brand accent is overridden on Fluent's theme; secondary surfaces,
 * strokes, and neutral ramps continue to use Fluent's `webLightTheme` /
 * `webDarkTheme` values.
 */

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

/**
 * The LernChih brand palette. The cobalt accent is the only color that
 * overrides Fluent's brand tokens; the off-black / off-white values are
 * reference values for app-level surfaces (the body background is handled
 * by Fluent's `colorNeutralBackground1`).
 *
 * Contrast notes:
 *  - `cobaltLight` (#1E4FD8) on white ≈ 6.6:1 — passes WCAG AA for text.
 *  - `cobaltDark`  (#5B8DEF) on dark   ≈ 5.3:1 — passes WCAG AA for text
 *    on the dark neutral surface.
 */
export interface BrandPalette {
    /** Primary cobalt accent for light mode. */
    readonly cobaltLight: string;
    /** Primary cobalt accent for dark mode (lighter, for contrast on dark). */
    readonly cobaltDark: string;
    /** Off-black text for light surfaces (not pure #000). */
    readonly offBlackText: string;
    /** Off-white surface for light mode (not pure #fff). */
    readonly offWhiteSurface: string;
    /** Off-white text for dark surfaces. */
    readonly offWhiteText: string;
    /** Off-black surface for dark mode. */
    readonly offBlackSurface: string;
}

export const brandPalette: BrandPalette = {
    cobaltLight: "#1E4FD8",
    cobaltDark: "#5B8DEF",
    offBlackText: "#0A0A0B",
    offWhiteSurface: "#FAFAFA",
    offWhiteText: "#F4F4F5",
    offBlackSurface: "#0A0A0B",
};

/* ------------------------------------------------------------------ */
/* Radius                                                              */
/* ------------------------------------------------------------------ */

export interface BrandRadius {
    readonly card: number;
    readonly input: number;
    readonly button: number;
    readonly pill: number;
}

export const brandRadius: BrandRadius = {
    card: 12,
    input: 8,
    button: 8,
    pill: 999,
};

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

export interface BrandMotion {
    readonly fast: string;
    readonly base: string;
    readonly slow: string;
    readonly ease: string;
}

export const brandMotion: BrandMotion = {
    fast: "180ms",
    base: "280ms",
    slow: "480ms",
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
};

/* ------------------------------------------------------------------ */
/* Shadows                                                             */
/* ------------------------------------------------------------------ */

/**
 * Tinted shadow tokens. The light variants carry a faint cobalt tint so
 * elevated cards/inputs feel branded rather than generic grey. The dark
 * variants use deeper black with a small cobalt glow on focus rings.
 */
export interface BrandShadowSet {
    /** Default elevation for cards and surfaces. */
    readonly card: string;
    /** Stronger elevation for popovers, dialogs, and lifted states. */
    readonly lift: string;
    /** Focus ring shadow (pair with a transparent outline for accessibility). */
    readonly focus: string;
}

export interface BrandShadows {
    readonly light: BrandShadowSet;
    readonly dark: BrandShadowSet;
}

export const brandShadows: BrandShadows = {
    light: {
        card: "0 4px 12px rgba(30, 79, 216, 0.08)",
        lift: "0 8px 24px rgba(30, 79, 216, 0.12)",
        focus: "0 0 0 3px rgba(30, 79, 216, 0.24)",
    },
    dark: {
        card: "0 4px 12px rgba(0, 0, 0, 0.4)",
        lift: "0 8px 24px rgba(0, 0, 0, 0.5)",
        focus: "0 0 0 3px rgba(91, 141, 239, 0.4)",
    },
};
