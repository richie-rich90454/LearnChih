import { makeStyles } from "@fluentui/react-components";
import { motion, useReducedMotion } from "motion/react";

export interface LogoMarkProps {
    /** Size in pixels for both width and height of the mark. Default 32. */
    size?: number;
    /** Additional className applied to the root element. */
    className?: string;
    /** Accessible title. When omitted, the mark is treated as decorative. */
    title?: string;
}

export type LogoFullProps = LogoMarkProps;

const useLogoStyles = makeStyles({
    cobalt: {
        color: "#1E4FD8",
        "@media (prefers-color-scheme: dark)": {
            color: "#5B8DEF",
        },
    },
    wordmark: {
        fontFamily:
            "var(--font-sans, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif)",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        // Use concrete hex values instead of tokens.colorNeutralForeground1
        // because axe-core/pa11y cannot resolve CSS custom properties like
        // var(--colorNeutralForeground1). #242424 is Fluent v9 light-mode
        // colorNeutralForeground1; #FFFFFF is the dark-mode equivalent.
        color: "#242424",
        backgroundColor: "#FFFFFF",
        "@media (prefers-color-scheme: dark)": {
            color: "#FFFFFF",
            backgroundColor: "#1A1A1A",
        },
    },
});

// A stylized "L" formed by a vertical stem intersecting a foot with a
// diagonal cut. The diagonal represents forward progress (learning).
// Centered in a 48x48 viewBox using bold fills (no strokes) so it scales
// cleanly from 16px (favicon) to 192px (PWA icon).
const MARK_PATH = "M8 6 L18 6 L18 30 L30 30 L40 42 L8 42 Z";

interface MarkSvgProps {
    size: number;
    fill: string;
    className?: string;
    title?: string;
}

function MarkSvg({ size, fill, className, title }: MarkSvgProps) {
    const isDecorative = !title;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role={isDecorative ? undefined : "img"}
            aria-hidden={isDecorative ? true : undefined}
            aria-label={isDecorative ? undefined : title}
            focusable={false}
        >
            {title ? <title>{title}</title> : null}
            <path d={MARK_PATH} fill={fill} />
        </svg>
    );
}

/**
 * The LernChih brand mark in cobalt. Used as favicon, PWA icon, and app icon.
 * The cobalt shifts to a lighter tone under `prefers-color-scheme: dark`.
 */
export function LogoMark({ size = 32, className, title }: LogoMarkProps) {
    const styles = useLogoStyles();
    const merged = className ? `${styles.cobalt} ${className}` : styles.cobalt;
    return (
        <MarkSvg size={size} fill="currentColor" className={merged} title={title} />
    );
}

/**
 * The LernChih brand mark in monochrome. Uses `currentColor` so it inherits
 * the surrounding text color. Used in footers and dark contexts where a
 * colored logo would clash.
 */
export function LogoMono({ size = 32, className, title }: LogoMarkProps) {
    return (
        <MarkSvg size={size} fill="currentColor" className={className} title={title} />
    );
}

/**
 * The full LernChih lockup: the cobalt mark next to the "LernChih" wordmark.
 * Used in the sidebar header and mobile drawer header. The `size` prop
 * controls the mark height; the wordmark scales proportionally. Default 28.
 */
export function LogoFull({ size = 28, className, title }: LogoFullProps) {
    const styles = useLogoStyles();
    return (
        <span
            className={className}
            role={title ? "img" : undefined}
            aria-label={title || undefined}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: `${Math.round(size * 0.32)}px`,
            }}
        >
            <LogoMark size={size} />
            <span
                className={styles.wordmark}
                style={{ fontSize: `${Math.round(size * 0.82)}px` }}
                aria-hidden={title ? true : undefined}
            >
                LernChih
            </span>
        </span>
    );
}

/**
 * The LernChih brand mark with an animated stroke-draw effect. On first
 * viewport entry, the "L" path is drawn via stroke-dashoffset, then a cobalt
 * fill fades in. Respects prefers-reduced-motion by rendering the fully-drawn
 * mark immediately. The cobalt stroke/fill shifts tone under dark mode via the
 * same `prefers-color-scheme` rule used by `LogoMark`.
 */
export function LogoMarkAnimated({ size = 48, className, title }: LogoMarkProps) {
    const reduced = useReducedMotion();
    const styles = useLogoStyles();
    const merged = className ? `${styles.cobalt} ${className}` : styles.cobalt;
    const isDecorative = !title;

    if (reduced) {
        return (
            <MarkSvg size={size} fill="currentColor" className={merged} title={title} />
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className={merged}
            role={isDecorative ? undefined : "img"}
            aria-hidden={isDecorative ? true : undefined}
            aria-label={isDecorative ? undefined : title}
            focusable={false}
        >
            {title ? <title>{title}</title> : null}
            <motion.path
                d={MARK_PATH}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={200}
                initial={{ strokeDashoffset: 200, fillOpacity: 0 }}
                whileInView={{ strokeDashoffset: 0, fillOpacity: 1 }}
                viewport={{ once: true }}
                transition={{
                    strokeDashoffset: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                    fillOpacity: { duration: 0.4, delay: 1.0, ease: [0.16, 1, 0.3, 1] },
                }}
            />
        </svg>
    );
}
