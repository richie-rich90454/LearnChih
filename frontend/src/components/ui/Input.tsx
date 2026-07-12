import { useId, type ReactNode } from "react";
import {
    Input as FluentInput,
    type InputProps as FluentInputProps,
} from "@fluentui/react-components";
import styles from "./Input.module.css";

export type InputSize = "small" | "medium" | "large";

/*
 * Inline-validation convention (B67): Forms should validate fields inline
 * (onBlur or onChange) and surface the first failing rule via the `error`
 * prop of this Input. Passing a non-empty `error` flips the field into the
 * error state (red border + `aria-invalid` + `role="alert"` message) so the
 * user gets immediate feedback without a full submit round-trip. Clear
 * `error` (pass `undefined`) once the field becomes valid.
 */

/**
 * Optional character counter. The caller owns the `current` value (typically
 * derived from a controlled `value` prop) so both controlled and uncontrolled
 * inputs can opt in without the wrapper needing to track internal state.
 */
export interface InputCounter {
    current: number;
    max: number;
}

const sizeClass: Record<InputSize, string> = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

/**
 * Extended Input props. Adds a label, helper text, error message, and an
 * optional character counter around the Fluent Input field. The Fluent Input
 * keeps field behavior + a11y; the wrapper wires `aria-invalid` and
 * `aria-describedby` so screen readers announce helper/error text.
 *
 * `className` is forwarded to the field (preserving prior behavior); use
 * `wrapperClassName` to style the outer stack.
 *
 * Focus-order convention (B56): This Input forwards all native Fluent Input
 * props including `tabIndex`, so multi-step forms can assign explicit
 * `tabIndex` values (1, 2, 3, ...) to keep Tab focus in a logical order
 * across revealed steps. Set `tabIndex={-1}` on inputs in hidden/ future
 * steps so they are skipped until the step becomes active.
 */
export interface InputProps extends Omit<FluentInputProps, "size"> {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: ReactNode;
    counter?: InputCounter;
    size?: InputSize;
    wrapperClassName?: string;
}

/*
 * Form-state preservation convention (B70): On a failed submit, forms MUST
 * preserve the user's entered field values so they can fix and resubmit
 * without retyping. This is the default React behavior when state is held in
 * `useState` (or a form library) and only the `error` prop toggles - the
 * Input is a controlled/uncontrolled passthrough and never resets `value` on
 * its own. Form handlers must NOT clear state on error; clear only on
 * successful submit or an explicit user reset action.
 */
function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Input({
    label,
    helperText,
    error,
    counter,
    size = "medium",
    className,
    wrapperClassName,
    id,
    required,
    ...rest
}: InputProps) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error);

    const describedBy = [helperText ? helperId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    /*
     * Error-message rendering convention (B68): Field-level error messages
     * MUST be announced to assistive tech via `aria-describedby` (wired above
     * so the field points at `errorId`) and rendered with `role="alert"` so
     * screen readers announce the message when it appears. The visual color
     * comes from the `--status-danger` token (applied via `.errorText` in
     * Input.module.css) so error text stays theme-aware and WCAG-compliant in
     * both light and dark themes. Every field-level error in the app should
     * follow this same pattern for consistency.
     */
    const fieldClasses = cx(
        styles.input,
        sizeClass[size],
        hasError && styles.error,
        className,
    );

    const over = counter ? counter.current > counter.max : false;

    return (
        <div className={cx(styles.wrapper, wrapperClassName)}>
            {label && (
                <label className={styles.label} htmlFor={inputId}>
                    {label}
                    {/* Required-field indicator (B71): a red asterisk marks
                       required fields and is hidden from AT because the field
                       itself carries aria-required + the native required attr. */}
                    {required && (
                        <span className={styles.requiredMark} aria-hidden="true">
                            {" *"}
                        </span>
                    )}
                </label>
            )}
            <div className={styles.fieldRow}>
                <FluentInput
                    id={inputId}
                    className={fieldClasses}
                    size={size}
                    required={required}
                    aria-invalid={hasError || undefined}
                    aria-required={required || undefined}
                    aria-describedby={describedBy}
                    {...rest}
                />
            </div>
            {(helperText || hasError || counter) && (
                <div className={styles.helperRow}>
                    {hasError ? (
                        <p className={styles.errorText} id={errorId} role="alert">
                            {error}
                        </p>
                    ) : helperText ? (
                        <p className={styles.helper} id={helperId}>
                            {helperText}
                        </p>
                    ) : (
                        <span />
                    )}
                    {counter && (
                        <span
                            className={cx(styles.counter, over && styles.counterOver)}
                            aria-hidden="true"
                        >
                            {counter.current}/{counter.max}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
