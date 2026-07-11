import { useTranslation } from "react-i18next";
import { WeatherSnow24Regular } from "@fluentui/react-icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStreakStore, todayIso } from "@/store/streakStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./StreakFreeze.module.css";

/**
 * Dashboard card for the learning streak freeze (F20). Shows the current
 * streak, the number of freezes used this week (X/1), and a "Freeze today"
 * button that is enabled only when `canUseFreeze` returns true for today.
 *
 * Spec ref: F20.
 */
export function StreakFreeze() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const currentStreak = useStreakStore((s) => s.currentStreak);
    const freezesUsedThisWeek = useStreakStore((s) => s.freezesUsedThisWeek);
    const canUseFreeze = useStreakStore((s) => s.canUseFreeze);
    const useFreeze = useStreakStore((s) => s.useFreeze);

    const today = todayIso();
    const canFreeze = canUseFreeze(today);

    const handleFreeze = () => {
        useFreeze(today);
    };

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    <WeatherSnow24Regular />
                </span>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>
                        {t("streakFreeze.title", "Streak Freeze")}
                    </h2>
                    <p className={styles.subtitle}>
                        {t("streakFreeze.description", "Protect your streak on a missed day.")}
                    </p>
                </div>
                <Badge variant="accent">
                    {t("streakFreeze.streakValue", { count: currentStreak, defaultValue: `${currentStreak} day(s)` })}
                </Badge>
            </div>

            <div className={styles.row}>
                <p className={styles.usage}>
                    {t("streakFreeze.usedThisWeek", "Freezes used this week")}
                    <span className={styles.usageCount}>
                        {t("streakFreeze.usedCount", { used: freezesUsedThisWeek, max: 1, defaultValue: `${freezesUsedThisWeek}/1` })}
                    </span>
                </p>
                <Button
                    variant={canFreeze ? "primary" : "outline"}
                    icon={<WeatherSnow24Regular />}
                    onClick={handleFreeze}
                    disabled={!canFreeze}
                    className={reduced ? styles.noAnim : undefined}
                >
                    {t("streakFreeze.freezeToday", "Freeze today")}
                </Button>
            </div>

            {!canFreeze && (
                <p className={styles.hint}>
                    {t("streakFreeze.noFreezeHint", "You've used this week's freeze. It refreshes Monday.")}
                </p>
            )}
        </Card>
    );
}

export default StreakFreeze;
