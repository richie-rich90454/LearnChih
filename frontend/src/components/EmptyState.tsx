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
 *
 * CONVENTION (B76): Every data-driven page MUST render <EmptyState> when its
 * data set is empty — never raw text or a bare <p>. This guarantees a
 * consistent, accessible empty experience across the app. Pages currently
 * using EmptyState:
 *   - NotesPage, DraftsInboxPage, LeaderboardPage, ChannelsPage,
 *     DashboardPage, StudyGroupsPage, FlashcardsPage, BookmarksPage,
 *     StudyStatsPage, StudyBuddyPage, SearchPage, ReviewCalendarPage,
 *     ResourcesPage, QuizPage, QuestionBankPage, PlaylistsPage,
 *     NotificationsPage, MessagesPage, DueTodayPage, CohortsPage.
 * When adding a new data page, import and render <EmptyState> in its
 * empty branch instead of an ad-hoc message.
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
