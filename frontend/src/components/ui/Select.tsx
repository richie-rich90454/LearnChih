import { useId, type ReactNode } from "react";
import {
    Select as FluentSelect,
    type SelectProps as FluentSelectProps,
    Option,
    OptionGroup,
} from "@fluentui/react-components";
import styles from "./Select.module.css";

export type SelectSize = "small" | "medium" | "large";

const sizeClass: Record<SelectSize, string> = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

/**
 * Extended Select props. Mirrors the Input primitive: a label, helper text,
 * and an error message wrap the Fluent Select field. The Fluent Select
 * keeps listbox behavior + a11y; the wrapper wires `aria-invalid` and
 * `aria-describedby` so screen readers announce helper/error text.
 *
 * `className` is forwarded to the field; use `wrapperClassName` for the
 * outer stack. `Option` / `OptionGroup` are re-exported for convenience.
 */
export interface SelectProps extends Omit<FluentSelectProps, "size"> {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: ReactNode;
    size?: SelectSize;
    wrapperClassName?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export function Select({
    label,
    helperText,
    error,
    size = "medium",
    className,
    wrapperClassName,
    id,
    ...rest
}: SelectProps) {
    const reactId = useId();
    const selectId = id ?? reactId;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const hasError = Boolean(error);

    const describedBy = [helperText ? helperId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const fieldClasses = cx(styles.select, sizeClass[size], hasError && styles.error, className);

    return (
        <div className={cx(styles.wrapper, wrapperClassName)}>
            {label && (
                <label className={styles.label} htmlFor={selectId}>
                    {label}
                </label>
            )}
            <div className={styles.fieldRow}>
                <FluentSelect
                    id={selectId}
                    className={fieldClasses}
                    size={size}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    {...rest}
                />
            </div>
            {(helperText || hasError) && (
                <div className={styles.helperRow}>
                    {hasError ? (
                        <p className={styles.errorText} id={errorId} role="alert">
                            {error}
                        </p>
                    ) : (
                        <p className={styles.helper} id={helperId}>
                            {helperText}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export { Option, OptionGroup };
