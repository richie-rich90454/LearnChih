import { useEffect, useState, useCallback } from "react";
import { CheckmarkCircle24Filled, Circle24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./OnboardingChecklist.module.css";

const STORAGE_KEY = "lernchih-onboarding";

interface OnboardingState {
    dismissed?: boolean;
    steps?: Record<string, boolean>;
}

/** Step keys. Order here is the render order. */
const STEP_KEYS = [
    "profile",
    "joinChannel",
    "bookmark",
    "postThread",
    "takeQuiz",
] as const;

type StepKey = (typeof STEP_KEYS)[number];

function readState(): OnboardingState {
    if (typeof localStorage === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as OnboardingState;
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch {
        return {};
    }
}

function writeState(state: OnboardingState): void {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore storage errors (e.g. private mode quota)
    }
}

/**
 * Dashboard onboarding checklist (F67). Renders a Card with 5 starter steps;
 * some auto-detect completion (profile name set, any bookmark saved) while
 * the rest can be checked off manually. Dismissal and per-step state persist
 * in localStorage under `lernchih-onboarding`. Renders null once dismissed
 * or once every step is complete.
 *
 * Spec ref: F67.
 */
export function OnboardingChecklist() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const bookmarks = useBookmarkStore((s) => s.bookmarks);
    const [state, setState] = useState<OnboardingState>({});
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setState(readState());
        setHydrated(true);
    }, []);

    const persist = useCallback((next: OnboardingState) => {
        setState(next);
        writeState(next);
    }, []);

    // Auto-detected completion per step. Stored manual toggles OR detection
    // both count as done; auto steps cannot be un-checked manually.
    const autoDetected: Record<StepKey, boolean> = {
        profile: !!user?.name,
        joinChannel: false,
        bookmark: Object.keys(bookmarks ?? {}).length > 0,
        postThread: false,
        takeQuiz: false,
    };

    const isDone = (key: StepKey): boolean =>
        !!state.steps?.[key] || autoDetected[key];

    const doneCount = STEP_KEYS.filter((k) => isDone(k)).length;
    const allDone = doneCount === STEP_KEYS.length;

    // Hide until localStorage hydrates so dismissed users never see a flash.
    if (!hydrated) return null;
    if (state.dismissed) return null;
    // Auto-hide once everything is complete — no need to linger.
    if (allDone) return null;

    const toggleStep = (key: StepKey) => {
        // Auto-detected steps reflect detection and are not manually toggled.
        if (autoDetected[key]) return;
        const prevSteps = state.steps ?? {};
        const next: OnboardingState = {
            ...state,
            steps: { ...prevSteps, [key]: !prevSteps[key] },
        };
        persist(next);
    };

    const hide = () => persist({ ...state, dismissed: true });

    const pct = Math.round((doneCount / STEP_KEYS.length) * 100);

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{t("onboarding.title")}</h2>
                    <p className={styles.subtitle}>
                        {t("onboarding.progress", {
                            done: doneCount,
                            total: STEP_KEYS.length,
                        })}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="small"
                    icon={<Dismiss24Regular />}
                    onClick={hide}
                    aria-label={t("onboarding.hide")}
                >
                    {t("onboarding.hide")}
                </Button>
            </div>

            <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={doneCount}
                aria-valuemin={0}
                aria-valuemax={STEP_KEYS.length}
                aria-label={t("onboarding.progress", {
                    done: doneCount,
                    total: STEP_KEYS.length,
                })}
            >
                <div className={styles.progressBar} style={{ width: `${pct}%` }} />
            </div>

            <ul className={styles.list}>
                {STEP_KEYS.map((key) => {
                    const done = isDone(key);
                    const auto = autoDetected[key];
                    return (
                        <li key={key}>
                            <button
                                type="button"
                                className={styles.row}
                                onClick={() => toggleStep(key)}
                                disabled={auto}
                                aria-pressed={done}
                                aria-label={t(`onboarding.steps.${key}`)}
                            >
                                <span className={styles.icon} aria-hidden="true">
                                    {done ? (
                                        <CheckmarkCircle24Filled
                                            className={styles.iconDone}
                                        />
                                    ) : (
                                        <Circle24Regular
                                            className={styles.iconTodo}
                                        />
                                    )}
                                </span>
                                <span
                                    className={
                                        done ? styles.labelDone : styles.labelTodo
                                    }
                                >
                                    {t(`onboarding.steps.${key}`)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

export default OnboardingChecklist;
