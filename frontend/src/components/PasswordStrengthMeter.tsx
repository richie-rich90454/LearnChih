/**
 * PasswordStrengthMeter (B72)
 *
 * A visual strength indicator for password fields. Scores a password on a
 * 4-tier scale (weak / fair / good / strong) using length + character
 * variety (lowercase, uppercase, digit, symbol). The meter is a row of
 * segments that fill to the current tier and a live label announced to
 * screen readers via aria-live.
 *
 * Colors come from design-system status tokens (--status-danger /
 * --status-warning / --status-success) so the meter stays theme-aware and
 * WCAG-compliant. The component is presentational: pass it a `password`
 * string and it computes the score. It is NOT wired into LoginPage here -
 * callers opt in by rendering it below a password Input.
 */
import { useId } from "react";
import styles from "./PasswordStrengthMeter.module.css";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthMeterProps {
    password: string;
    /** Optional translator for the strength label. Defaults to English. */
    labelMap?: Partial<Record<PasswordStrength, string>>;
}

const STRENGTH_ORDER: PasswordStrength[] = ["weak", "fair", "good", "strong"];

const DEFAULT_LABELS: Record<PasswordStrength, string> = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
};

/**
 * Score a password 0-3 based on length and character variety.
 * - < 8 chars OR only one character class => weak
 * - 8+ chars with 2 classes => fair
 * - 8+ chars with 3 classes => good
 * - 12+ chars with 4 classes (or 10+ with 4) => strong
 */
export function scorePassword(password: string): PasswordStrength {
    if (!password) return "weak";
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    const len = password.length;

    if (len < 8 || variety <= 1) return "weak";
    if (variety === 2) return "fair";
    if (variety === 3) return "good";
    if (variety === 4 && len >= 10) return "strong";
    return "good";
}

export function PasswordStrengthMeter({ password, labelMap }: PasswordStrengthMeterProps) {
    const strength = scorePassword(password);
    const filledCount = STRENGTH_ORDER.indexOf(strength) + 1;
    const label = labelMap?.[strength] ?? DEFAULT_LABELS[strength];
    const meterId = useId();

    return (
        <div className={styles.wrapper} id={meterId} aria-live="polite">
            <div className={styles.segments} role="img" aria-label={`Password strength: ${label}`}>
                {STRENGTH_ORDER.map((tier, i) => (
                    <span
                        key={tier}
                        className={[
                            styles.segment,
                            styles[tier],
                            i < filledCount ? styles.filled : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    />
                ))}
            </div>
            <span className={styles.label} data-strength={strength}>
                {label}
            </span>
        </div>
    );
}
