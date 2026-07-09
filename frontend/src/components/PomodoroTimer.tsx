import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Timer24Regular,
    Play24Regular,
    Pause24Regular,
    ArrowReset24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import {
    logStudySession,
    type StudySessionType,
} from "@/api/studySessions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./PomodoroTimer.module.css";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Mode = "focus" | "break";

function format(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Pomodoro focus timer (F7). Runs a 25-minute focus block followed by a
 * 5-minute break. Completed focus and break blocks are auto-logged to the
 * backend as StudySession entries. Pausing keeps the elapsed time; reset
 * returns to the start of the current block without logging.
 */
export function PomodoroTimer() {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");

    const [mode, setMode] = useState<Mode>("focus");
    const [secondsLeft, setSecondsLeft] = useState<number>(FOCUS_SECONDS);
    const [running, setRunning] = useState<boolean>(false);
    const [sessionsToday, setSessionsToday] = useState<number>(0);

    // Track the wall-clock start of the current block so we can compute the
    // real elapsed duration (resilient to tab throttling) when logging.
    const blockStartRef = useRef<Date | null>(null);

    const logMutation = useMutation({
        mutationFn: (vars: { type: StudySessionType; durationMinutes: number }) =>
            logStudySession({
                startTime: blockStartRef.current
                    ? blockStartRef.current.toISOString()
                    : new Date(Date.now() - vars.durationMinutes * 60_000).toISOString(),
                endTime: new Date().toISOString(),
                durationMinutes: vars.durationMinutes,
                type: vars.type,
            }),
        onSuccess: (_data, vars) => {
            if (vars.type === "FOCUS") {
                setSessionsToday((n) => n + 1);
                dispatchToast(
                    <Toast>
                        <ToastTitle>{t("pomodoro.sessionLogged")}</ToastTitle>
                    </Toast>,
                    { intent: "success" },
                );
            }
        },
    });

    const completeBlock = useCallback(
        (completedMode: Mode) => {
            const totalElapsed =
                completedMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
            const type: StudySessionType = completedMode === "focus" ? "FOCUS" : "BREAK";
            logMutation.mutate({ type, durationMinutes: Math.round(totalElapsed / 60) });

            const nextMode: Mode = completedMode === "focus" ? "break" : "focus";
            setMode(nextMode);
            setSecondsLeft(nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
            blockStartRef.current = running ? new Date() : null;
        },
        [logMutation, running],
    );

    useEffect(() => {
        if (!running) return;
        const id = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(id);
                    const completedMode = mode;
                    // Defer state transitions out of the updater.
                    window.setTimeout(() => completeBlock(completedMode), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, [running, mode, completeBlock]);

    const handleStartPause = () => {
        if (running) {
            // Pausing: freeze the running clock.
            setRunning(false);
        } else {
            // Starting/resuming: mark a fresh block start if none recorded.
            if (!blockStartRef.current) {
                blockStartRef.current = new Date();
            }
            setRunning(true);
        }
    };

    const handleReset = () => {
        setRunning(false);
        setMode("focus");
        setSecondsLeft(FOCUS_SECONDS);
        blockStartRef.current = null;
    };

    const totalForMode = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
    const progress = totalForMode > 0 ? (totalForMode - secondsLeft) / totalForMode : 0;
    const circumference = 2 * Math.PI * 52;
    const dashOffset = circumference * (1 - progress);

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    <Timer24Regular />
                </span>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>{t("pomodoro.title")}</h2>
                    <p className={styles.subtitle}>{t("pomodoro.description")}</p>
                </div>
                <Badge variant={mode === "focus" ? "accent" : "success"}>
                    {mode === "focus" ? t("pomodoro.focus") : t("pomodoro.break")}
                </Badge>
            </div>

            <div className={styles.dialRow}>
                <svg
                    className={styles.dial}
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label={`${t("pomodoro.timeLeft")}: ${format(secondsLeft)}`}
                >
                    <circle
                        className={styles.dialTrack}
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        strokeWidth="8"
                    />
                    <circle
                        className={mode === "focus" ? styles.dialFocus : styles.dialBreak}
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 60 60)"
                    />
                    <text
                        className={styles.dialText}
                        x="60"
                        y="62"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {format(secondsLeft)}
                    </text>
                </svg>
            </div>

            <div className={styles.controls}>
                <Button
                    variant={running ? "outline" : "primary"}
                    icon={running ? <Pause24Regular /> : <Play24Regular />}
                    onClick={handleStartPause}
                >
                    {running ? t("pomodoro.pause") : t("pomodoro.start")}
                </Button>
                <Button
                    variant="subtle"
                    icon={<ArrowReset24Regular />}
                    onClick={handleReset}
                >
                    {t("pomodoro.reset")}
                </Button>
                {mode === "break" && running && (
                    <Button variant="ghost" onClick={() => completeBlock("break")}>
                        {t("pomodoro.skipBreak")}
                    </Button>
                )}
            </div>

            <p className={styles.sessions}>
                {t("pomodoro.sessions", { count: sessionsToday })}
            </p>
        </Card>
    );
}
