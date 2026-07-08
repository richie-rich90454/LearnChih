import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import styles from "./WorkspaceTabs.module.css";

/**
 * Derives a human tab title from a pathname. Known base paths map to their
 * i18n nav labels; detail routes (with an :id segment) collapse to a short
 * label; anything else falls back to a capitalized last segment.
 */
function deriveTitle(
    pathname: string,
    t: (key: string) => string,
): string {
    if (pathname === "/") return t("nav.dashboard");
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return t("nav.dashboard");

    const base = `/${segments[0]}`;
    const navKeyMap: Record<string, string> = {
        "/dashboard": "nav.dashboard",
        "/resources": "nav.resources",
        "/channels": "nav.channels",
        "/leaderboard": "nav.leaderboard",
        "/profile": "nav.profile",
        "/admin": "nav.admin",
        "/moderation": "nav.moderation",
        "/flashcards": "nav.flashcards",
        "/quizzes": "nav.quizzes",
        "/study-groups": "nav.studyGroups",
        "/search": "nav.resources",
        "/bookmarks": "nav.studyGroups",
    };

    if (segments.length === 1) {
        const key = navKeyMap[base];
        if (key) return t(key);
    }

    // Detail page (has an id segment) — short label by resource type.
    if (segments[0] === "resources") return t("nav.resources");
    if (segments[0] === "channels") return t("nav.channels");
    if (segments[0] === "profile") return t("nav.profile");

    // Fallback: capitalize the last segment.
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1);
}

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

/**
 * A session tab bar rendered above the content area. The current route
 * auto-registers a tab; clicking a tab navigates to its route; the close
 * button removes it. Tabs live only in memory (workspaceStore).
 *
 * Spec ref: F70.
 */
export function WorkspaceTabs() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { tabs, addTab, removeTab } = useWorkspaceStore();

    // Auto-add a tab for the current route whenever it changes.
    useEffect(() => {
        addTab({ path: location.pathname, title: deriveTitle(location.pathname, t) });
    }, [location.pathname, addTab, t]);

    if (tabs.length === 0) return null;

    const isActive = (path: string): boolean => {
        if (path === "/") return location.pathname === "/";
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const handleClose = (
        e: React.MouseEvent<HTMLButtonElement>,
        path: string,
    ) => {
        e.stopPropagation();
        e.preventDefault();
        const wasActive = isActive(path);
        removeTab(path);
        // If we closed the active tab, navigate to the last remaining tab
        // (or fall back to the dashboard).
        if (wasActive) {
            const remaining = useWorkspaceStore.getState().tabs;
            const target = remaining.length > 0 ? remaining[remaining.length - 1].path : "/dashboard";
            navigate(target);
        }
    };

    return (
        <div className={styles.tabBar} role="tablist" aria-label="Workspace tabs">
            <div className={styles.scrollArea}>
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <div
                            key={tab.path}
                            role="tab"
                            tabIndex={0}
                            aria-selected={active}
                            className={cx(styles.tab, active && styles.tabActive)}
                            onClick={() => navigate(tab.path)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    navigate(tab.path);
                                }
                            }}
                        >
                            <span className={styles.tabLabel}>{tab.title}</span>
                            <button
                                type="button"
                                className={styles.closeBtn}
                                aria-label={`Close ${tab.title}`}
                                onClick={(e) => handleClose(e, tab.path)}
                            >
                                <Dismiss24Regular />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default WorkspaceTabs;
