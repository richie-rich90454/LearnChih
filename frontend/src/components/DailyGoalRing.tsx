import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Target24Regular, Add24Regular } from "@fluentui/react-icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDailyGoalStore } from "@/store/dailyGoalStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./DailyGoalRing.module.css";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Daily study goal with a circular SVG progress ring (F21). Shows
 * todayMinutes / dailyGoalMinutes as a ring fill, with a "Log 25 min" button
 * and an editable goal field. Resets the day's minutes when the date changes.
 *
 * Spec ref: F21.
 */
export function DailyGoalRing() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const dailyGoalMinutes = useDailyGoalStore((s) => s.dailyGoalMinutes);
    const todayMinutes = useDailyGoalStore((s) => s.todayMinutes);
    const setGoal = useDailyGoalStore((s) => s.setGoal);
    const addMinutes = useDailyGoalStore((s) => s.addMinutes);
    const resetIfNewDay = useDailyGoalStore((s) => s.resetIfNewDay);

    const [goalInput, setGoalInput] = useState<string>(String(dailyGoalMinutes));

    // Reset the day's minutes if the app was left open across midnight.
    useEffect(() => {
        resetIfNewDay();
    }, [resetIfNewDay]);

    const goal = Math.max(1, dailyGoalMinutes);
    const ratio = Math.min(1, todayMinutes / goal);
    const dashOffset = CIRCUMFERENCE * (1 - ratio);
    const pct = Math.round(ratio * 100);

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGoalInput(e.target.value);
    };

    const handleGoalBlur = () => {
        const parsed = Number(goalInput);
        if (Number.isFinite(parsed) && parsed > 0) {
            setGoal(parsed);
            setGoalInput(String(parsed));
        } else {
            setGoalInput(String(dailyGoalMinutes));
        }
    };

    const handleLog = () => {
        addMinutes(25);
    };

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    <Target24Regular />
                </span>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>
                        {t("dailyGoal.title", "Daily Goal")}
                    </h2>
                    <p className={styles.subtitle}>
                        {t("dailyGoal.description", "Track your daily study minutes.")}
                    </p>
                </div>
            </div>

            <div className={styles.body}>
                <svg
                    className={styles.ring}
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label={t("dailyGoal.progressAria", { defaultValue: `${pct}% of daily goal`, percent: pct })}
                >
                    <circle
                        className={styles.ringTrack}
                        cx="60"
                        cy="60"
                        r={RADIUS}
                        fill="none"
                        strokeWidth="8"
                    />
                    <circle
                        className={reduced ? styles.ringFillStatic : styles.ringFill}
                        cx="60"
                        cy="60"
                        r={RADIUS}
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 60 60)"
                    />
                    <text
                        className={styles.ringText}
                        x="60"
                        y="56"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {todayMinutes}
                    </text>
                    <text
                        className={styles.ringSubtext}
                        x="60"
                        y="74"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {t("dailyGoal.minutes", "min")}
                    </text>
                </svg>

                <div className={styles.controls}>
                    <div className={styles.goalRow}>
                        <span className={styles.goalLabel}>
                            {t("dailyGoal.goalLabel", "Goal (min)")}
                        </span>
                        <Input
                            type="number"
                            value={goalInput}
                            onChange={handleGoalChange}
                            onBlur={handleGoalBlur}
                            size="small"
                            className={styles.goalInput}
                            min={1}
                            max={1440}
                            aria-label={t("dailyGoal.goalAria", "Daily goal in minutes")}
                        />
                    </div>
                    <p className={styles.progressText}>
                        {t("dailyGoal.progress", {
                            defaultValue: "{{done}} / {{goal}} min ({{pct}}%)",
                            done: todayMinutes,
                            goal: dailyGoalMinutes,
                            pct,
                        })}
                    </p>
                    <Button
                        variant="primary"
                        icon={<Add24Regular />}
                        onClick={handleLog}
                    >
                        {t("dailyGoal.log25", "Log 25 min")}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default DailyGoalRing;
