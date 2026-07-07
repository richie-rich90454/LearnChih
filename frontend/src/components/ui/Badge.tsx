import {
    Badge as FluentBadge,
    type BadgeProps as FluentBadgeProps,
} from "@fluentui/react-components";
import styles from "./Badge.module.css";

/**
 * Design-system Badge variants. Each maps to a Fluent `color` for behavior
 * while the co-located CSS Module owns the soft-background + foreground
 * pairing via tokens. Pill radius is enforced for every variant.
 */
export type BadgeVariant = "accent" | "neutral" | "success" | "warning" | "danger";

const variantToColor: Record<BadgeVariant, FluentBadgeProps["color"]> = {
    accent: "brand",
    neutral: "informative",
    success: "success",
    warning: "warning",
    danger: "danger",
};

const variantClass: Record<BadgeVariant, string> = {
    accent: styles.accent,
    neutral: styles.neutral,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
};

/**
 * Extended Badge props. `variant` is the design-system alias for Fluent's
 * `color`; if both are passed, `variant` wins. The wrapper renders with
 * `appearance="tint"` (soft background) by default so the token-based soft
 * backgrounds read correctly; callers can still override `appearance`.
 */
export interface BadgeProps extends FluentBadgeProps {
    variant?: BadgeVariant;
}

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Badge({ variant, color, appearance = "tint", className, ...rest }: BadgeProps) {
    const resolvedColor = variant ? variantToColor[variant] : color;
    const classes = cx(styles.badge, variant && variantClass[variant], className);
    return (
        <FluentBadge className={classes} appearance={appearance} color={resolvedColor} {...rest} />
    );
}
