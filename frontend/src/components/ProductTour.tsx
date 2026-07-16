import { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/Button";
import styles from "./ProductTour.module.css";

const COMPLETED_KEY = "lernchih-tour-completed";
const START_DELAY_MS = 1500;
/** Visual padding (px) between the target and the accent ring. */
const PADDING = 6;

interface TourStep {
    selector: string;
    titleKey: string;
    bodyKey: string;
}

const STEPS: TourStep[] = [
    {
        selector: '[data-tour="sidebar-nav"]',
        titleKey: "tour.steps.sidebarNav.title",
        bodyKey: "tour.steps.sidebarNav.body",
    },
    {
        selector: '[data-tour="command-palette"]',
        titleKey: "tour.steps.commandPalette.title",
        bodyKey: "tour.steps.commandPalette.body",
    },
    {
        selector: '[data-tour="notifications"]',
        titleKey: "tour.steps.notifications.title",
        bodyKey: "tour.steps.notifications.body",
    },
    {
        selector: '[data-tour="theme-toggle"]',
        titleKey: "tour.steps.themeToggle.title",
        bodyKey: "tour.steps.themeToggle.body",
    },
];

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

function isCompleted(): boolean {
    try {
        return localStorage.getItem(COMPLETED_KEY) === "1";
    } catch {
        return false;
    }
}

function markCompleted(): void {
    try {
        localStorage.setItem(COMPLETED_KEY, "1");
    } catch {
        // ignore storage errors (e.g. private mode quota)
    }
}

/**
 * Interactive product tour (F68). Spotlight overlay that highlights key UI
 * elements in sequence. Auto-starts for first-time users (no
 * `lernchih-tour-completed` in localStorage) on the first dashboard mount
 * after a 1.5s delay. The spotlight is a 4-band dark backdrop with a hole
 * cut for the target plus a 4px accent ring; a tooltip card is positioned
 * adjacent to the target via getBoundingClientRect(). Escape, Skip, and Done
 * all mark the tour completed so it never relaunches. Fades are omitted
 * under prefers-reduced-motion.
 *
 * Spec ref: F68.
 */
export function ProductTour() {
    const { t } = useTranslation();
    const location = useLocation();
    const reduced = useReducedMotion();
    const [step, setStep] = useState<number | null>(null);
    const [rect, setRect] = useState<Rect | null>(null);

    // Focus management: when the tour opens, save the currently focused
    // element so it can be restored on close, and move focus into the dialog
    // so keyboard and screen-reader users land inside the modal. The dialog
    // root is tabIndex={-1} so it is programmatically focusable but skipped
    // in the normal Tab order (the first Tab moves to the Skip button).
    const rootRef = useRef<HTMLDivElement>(null);
    const previousActiveRef = useRef<HTMLElement | null>(null);

    // Auto-start for first-time users on the dashboard.
    useEffect(() => {
        if (isCompleted()) return;
        if (!location.pathname.startsWith("/dashboard")) return;
        const id = window.setTimeout(() => {
            if (!isCompleted()) setStep(0);
        }, START_DELAY_MS);
        return () => window.clearTimeout(id);
    }, [location.pathname]);

    const finish = useCallback(() => {
        markCompleted();
        setStep(null);
        setRect(null);
    }, []);

    // Move focus into the dialog on open and restore it on close. This pairs
    // with aria-modal="true" so screen readers treat the tour as a true modal.
    useEffect(() => {
        if (step === null) {
            // Closing: restore focus to the element that had it before opening.
            const prev = previousActiveRef.current;
            if (prev && typeof prev.focus === "function") {
                prev.focus();
            }
            previousActiveRef.current = null;
            return;
        }
        // Opening: save current focus and move it into the dialog.
        const active = typeof document !== "undefined" ? document.activeElement : null;
        if (active && active instanceof HTMLElement && active !== rootRef.current) {
            previousActiveRef.current = active;
        }
        // Defer focus until after paint so the dialog is in the DOM.
        const id = window.requestAnimationFrame(() => {
            rootRef.current?.focus();
        });
        return () => window.cancelAnimationFrame(id);
    }, [step]);

    // Focus trap: keep Tab focus cycling within the dialog while it is open.
    // The only tabbable elements are the Skip and Next/Done buttons; we walk
    // the dialog subtree for them so the trap stays correct as the buttons
    // re-render between steps.
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Escape") {
                e.preventDefault();
                finish();
                return;
            }
            if (e.key !== "Tab") return;
            const root = rootRef.current;
            if (!root) return;
            const tabbable = root.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (tabbable.length === 0) {
                e.preventDefault();
                root.focus();
                return;
            }
            const first = tabbable[0];
            const last = tabbable[tabbable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first || document.activeElement === root) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
        [finish],
    );

    const next = useCallback(() => {
        setStep((prev) => {
            if (prev === null) return prev;
            const n = prev + 1;
            return n >= STEPS.length ? null : n;
        });
    }, []);

    // Escape is handled by the dialog root's onKeyDown (above) which also
    // traps Tab focus. The focus trap guarantees the dialog root receives the
    // keydown, so a separate window listener is not needed.

    // Measure the current target; re-measure on scroll/resize.
    useLayoutEffect(() => {
        if (step === null) {
            setRect(null);
            return;
        }
        const measure = () => {
            const el = document.querySelector<HTMLElement>(STEPS[step].selector);
            if (!el) {
                setRect(null);
                return;
            }
            const r = el.getBoundingClientRect();
            // Skip hidden (zero-size) elements.
            if (r.width === 0 && r.height === 0) {
                setRect(null);
                return;
            }
            setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        };
        measure();
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
        };
    }, [step]);

    // Advance past missing targets (e.g., notifications bell when signed out).
    useEffect(() => {
        if (step === null || rect !== null) return;
        const id = window.setTimeout(() => {
            const el = document.querySelector<HTMLElement>(STEPS[step].selector);
            if (!el || (el.offsetWidth === 0 && el.offsetHeight === 0)) {
                if (step < STEPS.length - 1) setStep(step + 1);
                else finish();
            }
        }, 250);
        return () => window.clearTimeout(id);
    }, [step, rect, finish]);

    if (step === null) return null;

    const isLast = step === STEPS.length - 1;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

    // Tooltip position: below target if there is room, otherwise above.
    // Clamped horizontally to stay within the viewport.
    const TOOLTIP_EST_HEIGHT = 180;
    const TOOLTIP_EST_WIDTH = 320;
    let tooltipTop: number;
    let tooltipLeft: number;
    if (rect) {
        const below = rect.top + rect.height + PADDING + TOOLTIP_EST_HEIGHT < vh;
        tooltipTop = below
            ? rect.top + rect.height + PADDING
            : Math.max(PADDING, rect.top - PADDING - TOOLTIP_EST_HEIGHT);
        tooltipLeft = Math.max(
            PADDING,
            Math.min(rect.left, vw - TOOLTIP_EST_WIDTH - PADDING),
        );
    } else {
        tooltipTop = vh / 2 - TOOLTIP_EST_HEIGHT / 2;
        tooltipLeft = vw / 2 - TOOLTIP_EST_WIDTH / 2;
    }

    // Four dark bands form the backdrop, leaving a hole at the target rect.
    const bands = rect
        ? [
              { top: 0, left: 0, width: vw, height: Math.max(0, rect.top - PADDING) },
              {
                  top: Math.max(0, rect.top - PADDING),
                  left: 0,
                  width: Math.max(0, rect.left - PADDING),
                  height: rect.height + PADDING * 2,
              },
              {
                  top: Math.max(0, rect.top - PADDING),
                  left: rect.left + rect.width + PADDING,
                  width: Math.max(0, vw - (rect.left + rect.width + PADDING)),
                  height: rect.height + PADDING * 2,
              },
              {
                  top: rect.top + rect.height + PADDING,
                  left: 0,
                  width: vw,
                  height: Math.max(0, vh - (rect.top + rect.height + PADDING)),
              },
          ]
        : [{ top: 0, left: 0, width: vw, height: vh }];

    const ringStyle = rect
        ? {
              top: rect.top - PADDING,
              left: rect.left - PADDING,
              width: rect.width + PADDING * 2,
              height: rect.height + PADDING * 2,
          }
        : null;

    return (
        <div
            className={styles.root}
            role="dialog"
            aria-modal="true"
            aria-label={t("tour.title")}
            ref={rootRef}
            tabIndex={-1}
            onKeyDown={onKeyDown}
        >
            {/* Click catcher: blocks interaction with the app beneath. */}
            <div className={styles.catcher} />
            {/* Dark backdrop with a hole for the target. */}
            {bands.map((b, i) => (
                <div
                    key={i}
                    className={`${styles.band} ${reduced ? "" : styles.bandAnimate}`}
                    style={{
                        top: b.top,
                        left: b.left,
                        width: b.width,
                        height: b.height,
                    }}
                />
            ))}
            {/* Accent ring around the target. */}
            {ringStyle && <div className={styles.ring} style={ringStyle} />}
            {/* Tooltip card. */}
            <div
                className={`${styles.tooltip} ${reduced ? "" : styles.tooltipAnimate}`}
                style={{ top: tooltipTop, left: tooltipLeft }}
            >
                <p className={styles.tooltipStep}>
                    {t("tour.stepOf", { current: step + 1, total: STEPS.length })}
                </p>
                <h2 className={styles.tooltipTitle}>{t(STEPS[step].titleKey)}</h2>
                <p className={styles.tooltipBody}>{t(STEPS[step].bodyKey)}</p>
                <div className={styles.tooltipActions}>
                    <Button variant="ghost" size="small" onClick={finish}>
                        {t("tour.skip")}
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={isLast ? finish : next}
                    >
                        {isLast ? t("tour.done") : t("tour.next")}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProductTour;
