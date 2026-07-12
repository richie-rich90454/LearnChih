import { Dismiss24Regular, Info24Regular, Warning24Regular, ErrorCircle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useAnnouncementStore, type AnnouncementSeverity } from "@/store/announcementStore";
import useAuthStore from "@/store/authStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./AnnouncementBanner.module.css";

const SEVERITY_ICON: Record<AnnouncementSeverity, React.ReactNode> = {
    info: <Info24Regular />,
    warning: <Warning24Regular />,
    critical: <ErrorCircle24Regular />,
};

export default function AnnouncementBanner() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const announcements = useAnnouncementStore((s) => s.announcements);
    const dismiss = useAnnouncementStore((s) => s.dismiss);
    const user = useAuthStore((s) => s.user);
    const userId = user ? String(user.userId) : "anonymous";

    const visible = announcements.find(
        (a) => a.active && !a.dismissedBy.includes(userId),
    );

    if (!visible) return null;

    return (
        <div
            className={`${styles.banner} ${styles[visible.severity]}`}
            role="status"
            aria-live="polite"
            style={reduced ? { transitionDuration: "0ms" } : undefined}
        >
            <span className={styles.icon} aria-hidden="true">
                {SEVERITY_ICON[visible.severity]}
            </span>
            <span className={styles.message}>{visible.message}</span>
            <button
                type="button"
                className={styles.closeBtn}
                onClick={() => dismiss(visible.id, userId)}
                aria-label={t("announcements.dismiss", "Dismiss announcement")}
            >
                <Dismiss24Regular />
            </button>
        </div>
    );
}
