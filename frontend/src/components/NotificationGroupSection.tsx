import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight24Regular, Checkmark24Regular } from "@fluentui/react-icons";
import { Text, Caption1 } from "@fluentui/react-components";
import { useNotificationGroupingStore } from "@/store/notificationGroupingStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AppNotification } from "@/store/notificationStore";
import { Button } from "@/components/ui/Button";
import styles from "./NotificationGroupSection.module.css";

export interface NotificationGroupSectionProps {
    group: string;
    label: string;
    notifications: AppNotification[];
    onItemClick: (id: number, link?: string) => void;
    onMarkGroupRead: (ids: number[]) => void;
    /** Render prop for a single notification row. */
    renderRow: (n: AppNotification) => ReactNode;
}

/**
 * A collapsible notification group. The header shows the group label, an
 * unread count badge, and a per-group "mark all as read" button. The
 * expanded/collapsed state persists per group id via the notification
 * grouping store. Respects prefers-reduced-motion by collapsing the chevron
 * rotation transition.
 *
 * Spec ref: F77.
 */
export function NotificationGroupSection({
    group,
    label,
    notifications,
    onItemClick,
    onMarkGroupRead,
    renderRow,
}: NotificationGroupSectionProps) {
    const { t } = useTranslation();
    const collapsed = useNotificationGroupingStore((s) => s.collapsed[group] ?? false);
    const toggle = useNotificationGroupingStore((s) => s.toggle);
    const reducedMotion = useReducedMotion();

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    const unreadCount = unreadIds.length;

    const chevronClass = [
        styles.chevron,
        !collapsed && styles.chevronExpanded,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.headerButton}
                    onClick={() => toggle(group)}
                    aria-expanded={!collapsed}
                    aria-label={
                        collapsed
                            ? t("notificationGroups.expand", "Expand")
                            : t("notificationGroups.collapse", "Collapse")
                    }
                >
                    <span
                        className={chevronClass}
                        style={
                            reducedMotion
                                ? { transition: "none" }
                                : undefined
                        }
                        aria-hidden="true"
                    >
                        <ChevronRight24Regular />
                    </span>
                    <span className={styles.groupLabel}>{label}</span>
                    {unreadCount > 0 && (
                        <span className={styles.countBadge}>{unreadCount}</span>
                    )}
                </button>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<Checkmark24Regular />}
                        onClick={() => onMarkGroupRead(unreadIds)}
                        aria-label={t("notificationGroups.markGroupRead", "Mark all read")}
                    >
                        {t("notificationGroups.markGroupRead", "Mark all read")}
                    </Button>
                )}
            </div>
            <div className={collapsed ? styles.bodyCollapsed : styles.body}>
                {notifications.length === 0 ? (
                    <p className={styles.groupLabel} style={{ padding: "var(--space-2) var(--space-3)", color: "var(--text-secondary)" }}>
                        {t("notificationGroups.empty", "No notifications in this group.")}
                    </p>
                ) : (
                    notifications.map((n) => (
                        <div key={n.id} onClick={() => onItemClick(n.id, n.link)}>
                            {renderRow(n)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default NotificationGroupSection;
