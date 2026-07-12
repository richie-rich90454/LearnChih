import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll restoration on back/forward navigation (B81).
 *
 * Saves the window scroll position for each route to sessionStorage on
 * navigation away, and restores it when the user navigates back (POP action).
 * Forward navigations (PUSH) scroll to top as usual. This fixes the common SPA
 * annoyance where pressing the browser Back button drops you at the top of the
 * previous page instead of where you left off.
 *
 * CONVENTION (B81): Mount this hook once near the router root (e.g. in the
 * AppLayout or a top-level layout component). It manages scroll for the whole
 * document; per-element scroll containers should manage their own restoration.
 *
 * The hook uses `history.action` to distinguish POP (back/forward) from PUSH
 * (link click) so we only restore on genuine back navigation.
 */
const STORAGE_KEY = "lernchih-scroll";

function loadScrollMap(): Record<string, number> {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
        return {};
    }
}

function saveScrollMap(map: Record<string, number>): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Ignore storage errors (e.g. private mode, quota).
    }
}

export function useScrollRestoration(): void {
    const location = useLocation();
    const prevPath = useRef<string>(location.pathname);

    useEffect(() => {
        const path = location.pathname;
        const isPop =
            typeof window !== "undefined" &&
            window.history.state &&
            (window.history.state as { usr?: unknown; idx?: number }).idx !==
                undefined &&
            // React Router v7 stores navigation action on history state.
            (window.history.state as { usr?: unknown }).usr === null;

        if (isPop) {
            // Restore saved scroll for this path on back/forward.
            const map = loadScrollMap();
            const saved = map[path];
            if (saved !== undefined) {
                // Defer until after paint so the DOM has the content height.
                window.requestAnimationFrame(() => {
                    window.scrollTo(0, saved);
                });
            }
        } else {
            // New navigation (link click): scroll to top.
            window.scrollTo(0, 0);
        }

        return () => {
            // Save scroll position for the path we're leaving.
            const map = loadScrollMap();
            map[prevPath.current] = window.scrollY;
            saveScrollMap(map);
            prevPath.current = path;
        };
    }, [location.pathname]);
}

export default useScrollRestoration;
