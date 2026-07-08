import { useState, useEffect } from "react";
import styles from "./ReadingProgress.module.css";

/**
 * A thin (3px) scroll-progress bar fixed to the top of the viewport. Reads
 * the scroll position of the app's main content container (#main-content,
 * which owns overflow:auto in AppLayout) and fills proportionally.
 *
 * Recomputes on scroll, window resize, and container content changes (via
 * ResizeObserver) so async resource loading updates the track. Respects
 * prefers-reduced-motion via the global index.css guard plus an explicit
 * module-level rule.
 *
 * Spec ref: F73.
 */
export function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = document.getElementById("main-content");
        if (!el) return;

        const compute = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const max = scrollHeight - clientHeight;
            const pct = max > 0 ? (scrollTop / max) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, pct)));
        };

        compute();
        el.addEventListener("scroll", compute, { passive: true });
        window.addEventListener("resize", compute);

        // Recompute when the content height changes (async resource load).
        const ro = new ResizeObserver(compute);
        ro.observe(el);

        return () => {
            el.removeEventListener("scroll", compute);
            window.removeEventListener("resize", compute);
            ro.disconnect();
        };
    }, []);

    return (
        <div className={styles.track} aria-hidden="true">
            <div className={styles.bar} style={{ width: `${progress}%` }} />
        </div>
    );
}

export default ReadingProgress;
