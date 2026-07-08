import type { ReactNode } from "react";
import { ErrorCircle24Regular } from "@fluentui/react-icons";
import { Button } from "./ui/Button";
import styles from "./States.module.css";

export interface ErrorStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    onRetry?: () => void;
    retryLabel?: string;
}

/**
 * Centered error-state surface. Re-skinned with the shared States.module.css:
 * a 64px danger-tinted icon, semibold title, muted body, and an outline retry
 * button. role="alert" ensures screen readers announce it assertively. The
 * default icon is a danger circle; callers can override with a contextual one.
 */
export function ErrorState({
    icon,
    title,
    description,
    onRetry,
    retryLabel = "Try again",
}: ErrorStateProps) {
    return (
        <div className={styles.error} role="alert">
            <div className={styles.errorIcon} aria-hidden="true">
                {icon ?? <ErrorCircle24Regular />}
            </div>
            <h2 className={styles.errorTitle}>{title}</h2>
            <p className={styles.errorBody}>{description}</p>
            {onRetry && (
                <div className={styles.errorAction}>
                    <Button variant="outline" onClick={onRetry}>
                        {retryLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ErrorState;
