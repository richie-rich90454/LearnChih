import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Toast,
    ToastTitle,
    ToastBody,
    useToastController,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useBookmarkStore } from "@/store/bookmarkStore";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (INPUT_TAGS.has(target.tagName)) return true;
    if (target.isContentEditable) return true;
    return false;
}

/** Strips the " — LernChih" site suffix so bookmark titles stay readable. */
function pageTitle(): string {
    const raw = typeof document !== "undefined" ? document.title : "";
    return raw.replace(/\s*[—–-]\s*LernChih\s*$/i, "").trim() || raw;
}

/**
 * Global keyboard shortcut that toggles the bookmark on the current resource
 * detail page when the user presses `b` outside any input/textarea/
 * contenteditable and with no modifier keys held. Mirrors the command
 * palette's bookmark action (local persisted store + toast confirmation).
 *
 * Resource id is read from the route via react-router (the component is
 * mounted in AppShell, outside the matched <Route>, so useParams returns
 * empty here — useLocation + a path regex is the established pattern, see
 * CommandPalette's `bookmarkPage` quick action).
 *
 * Spec ref: F66.
 */
export function KeyboardBookmarkToggle() {
    const { t } = useTranslation();
    const location = useLocation();
    const { toggleBookmark, isBookmarked } = useBookmarkStore();
    const { dispatchToast } = useToastController("main-toaster");

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "b" &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.altKey &&
                !e.shiftKey
            ) {
                if (isTypingTarget(e.target)) return;
                const match = location.pathname.match(/^\/resources\/(\d+)/);
                if (!match) return;
                const resourceId = Number(match[1]);
                if (!Number.isFinite(resourceId)) return;
                e.preventDefault();
                const wasBookmarked = isBookmarked(resourceId);
                toggleBookmark(resourceId, pageTitle(), location.pathname);
                dispatchToast(
                    <Toast>
                        <ToastTitle>
                            {t(
                                wasBookmarked
                                    ? "bookmarks.bookmarkRemoved"
                                    : "bookmarks.bookmarkAdded",
                            )}
                        </ToastTitle>
                        <ToastBody>{pageTitle()}</ToastBody>
                    </Toast>,
                    { intent: wasBookmarked ? "info" : "success" },
                );
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [location.pathname, toggleBookmark, isBookmarked, dispatchToast, t]);

    return null;
}

export default KeyboardBookmarkToggle;
