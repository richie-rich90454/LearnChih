import {
    Button as FluentButton,
    type ButtonProps as FluentButtonProps,
} from "@fluentui/react-components";
import styles from "./Button.module.css";

/**
 * Design-system Button variants. Each maps to a Fluent UI `appearance` for
 * behavior + a11y, while the co-located CSS Module owns the visual tokens.
 * `ghost` is the design-system name for Fluent's transparent appearance.
 */
export type ButtonVariant = "primary" | "subtle" | "outline" | "ghost";

export type ButtonSize = "small" | "medium" | "large";

const variantToAppearance: Record<ButtonVariant, FluentButtonProps["appearance"]> = {
    primary: "primary",
    subtle: "subtle",
    outline: "outline",
    ghost: "transparent",
};

const variantClass: Record<ButtonVariant, string> = {
    primary: styles.primary,
    subtle: styles.subtle,
    outline: styles.outline,
    ghost: styles.ghost,
};

const sizeClass: Record<ButtonSize, string> = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

/**
 * Extended Button props. `variant` is the design-system alias for Fluent's
 * `appearance` (with `ghost` -> `transparent`). If both are passed, `variant`
 * wins. All native Fluent Button props (icon, disabled, onClick, …) pass
 * through unchanged, so this is fully backward compatible with existing
 * callers that use `appearance` directly.
 *
 * `loading` is implemented by the design-system wrapper (disable + CSS
 * spinner) rather than delegated to Fluent, because the installed Fluent
 * version's ButtonProps does not expose a `loading` prop.
 *
 * Implemented as a type alias (not `interface extends`) because Fluent's
 * `ButtonProps` is a polymorphic slot intersection that cannot be extended
 * by an interface declaration.
 */
export type ButtonProps = FluentButtonProps & {
    variant?: ButtonVariant;
    loading?: boolean;
};

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Button({
    variant,
    appearance,
    size,
    loading,
    disabled,
    className,
    ...rest
}: ButtonProps) {
    const resolvedAppearance = variant ? variantToAppearance[variant] : appearance;
    const resolvedSize = (size ?? "medium") as ButtonSize;

    const classes = cx(
        styles.button,
        variant && variantClass[variant],
        sizeClass[resolvedSize],
        loading && styles.loading,
        className,
    );

    return (
        <FluentButton
            className={classes}
            appearance={resolvedAppearance}
            size={resolvedSize}
            disabled={loading || disabled}
            {...rest}
        />
    );
}
