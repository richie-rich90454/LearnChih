import { useId, type ReactNode } from "react";
import {
    Input as FluentInput,
    type InputProps as FluentInputProps,
} from "@fluentui/react-components";
import styles from "./Input.module.css";

export type InputSize = "small" | "medium" | "large";

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
 */
export interface InputProps extends Omit<FluentInputProps, "size"> {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: ReactNode;
    counter?: InputCounter;
    size?: InputSize;
    wrapperClassName?: string;
}

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
                </label>
            )}
            <div className={styles.fieldRow}>
                <FluentInput
                    id={inputId}
                    className={fieldClasses}
                    size={size}
                    aria-invalid={hasError || undefined}
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
