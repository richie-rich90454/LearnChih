import type { ReactNode } from "react";
import styles from "./States.module.css";

export interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

/**
 * Centered empty-state surface. Re-skinned with the shared States.module.css
 * so every empty state across the app (lists, dashboard, quizzes, flashcards)
 * reads consistently: a 64px currentColor icon, a semibold title, muted body
 * copy, and an optional action. role="status" keeps it announced politely.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className={styles.empty} role="status">
            <div className={styles.emptyIcon} aria-hidden="true">
                {icon}
            </div>
            <h2 className={styles.emptyTitle}>{title}</h2>
            <p className={styles.emptyBody}>{description}</p>
            {action && <div className={styles.emptyAction}>{action}</div>}
        </div>
    );
}

export default EmptyState;
