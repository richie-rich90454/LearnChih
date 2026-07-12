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
 *
 * CONVENTION (B77): Every data-driven page MUST render <ErrorState> with an
 * onRetry handler when its query fails — never a bare MessageBar or raw text.
 * This guarantees a consistent, recoverable error experience with a visible
 * retry affordance. Pages currently using ErrorState:
 *   - ChannelThreadPage, NotesPage, DraftsInboxPage, LeaderboardPage,
 *     ChannelsPage, DashboardPage, StudyGroupsPage, StudyStatsPage,
 *     StudyBuddyPage, SearchPage, ReviewCalendarPage, ResourcesPage,
 *     QuestionBankPage, PlaylistsPage, NotificationsPage, DueTodayPage,
 *     CohortsPage.
 * When adding a new data page, import and render <ErrorState onRetry={refetch}>
 * in its error branch instead of an ad-hoc message bar.
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
