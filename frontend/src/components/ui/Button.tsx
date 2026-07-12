import {
    Button as FluentButton,
    type ButtonProps as FluentButtonProps,
} from "@fluentui/react-components";
import styles from "./Button.module.css";

/**
 * Design-system Button variants. Each maps to a Fluent UI `appearance` for
 * behavior + a11y, while the co-located CSS Module owns the visual tokens.
 * `ghost` is the design-system name for Fluent's transparent appearance.
 *
 * Route-transition focus convention (B54): Focus loss during route
 * transitions is handled by `components/PageTransition` (owned separately)
 * which preserves the active element across the unmount/remount cycle.
 * Buttons rendered inside a transitioning page keep working through the
 * transition; this primitive does not need to manage transition focus.
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
 *
 * Focus management convention (B51): Dialogs and overlays that use this
 * Button as a trigger rely on `hooks/useFocusTrap` (owned separately) to
 * restore focus to the trigger element after the overlay closes. This
 * primitive does NOT manage focus return itself; the overlay owner must
 * wire `useFocusTrap` so focus returns to the trigger Button on dismiss.
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
    /*
     * Overlay focus-trap convention (B52): Overlays such as the CommandPalette
     * and any custom dropdown/portal that this Button opens MUST trap keyboard
     * focus within themselves while open (use `hooks/useFocusTrap`). The Button
     * primitive only provides the trigger + a11y semantics; focus trapping is
     * the overlay's responsibility so Tab/Shift+Tab cannot escape to the
     * background page while the overlay is visible.
     */
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
        // Submit-button pending convention (B69): Submit buttons MUST pass the
        // `loading` prop (not just `disabled`) during a pending request. `loading`
        // both disables the button (preventing double-submit) and shows a progress
        // affordance (cursor: progress + Fluent spinner) so the user sees the
        // request is in flight. See `disabled={loading || disabled}` below.
        <FluentButton
            className={classes}
            appearance={resolvedAppearance}
            size={resolvedSize}
            disabled={loading || disabled}
            {...rest}
        />
    );
}
