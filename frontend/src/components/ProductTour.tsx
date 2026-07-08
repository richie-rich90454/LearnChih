import { useEffect, useLayoutEffect, useState, useCallback } from "react";
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

    const next = useCallback(() => {
        setStep((prev) => {
            if (prev === null) return prev;
            const n = prev + 1;
            return n >= STEPS.length ? null : n;
        });
    }, []);

    // Escape closes (and marks completed so it doesn't relaunch).
    useEffect(() => {
        if (step === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                finish();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [step, finish]);

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
        <div className={styles.root} role="dialog" aria-label={t("tour.title")}>
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
                <h3 className={styles.tooltipTitle}>{t(STEPS[step].titleKey)}</h3>
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
