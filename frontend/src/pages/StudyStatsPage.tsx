import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@fluentui/react-components";
import { ChartMultiple24Regular, ArrowClockwise24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { getWeeklyStudySessions, type StudySession } from "@/api/studySessions";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./StudyStatsPage.module.css";

function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function toKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
    ).padStart(2, "0")}`;
}

interface DayBucket {
    key: string;
    label: string;
    date: Date;
    minutes: number;
    isToday: boolean;
}

/**
 * Build the last 7 days (oldest -> newest) and sum FOCUS minutes per day.
 * BREAK sessions are excluded from study-time stats.
 */
function buildWeek(sessions: StudySession[], t: (k: string) => string): DayBucket[] {
    const dayLabels = [
        t("studyStats.sun"),
        t("studyStats.mon"),
        t("studyStats.tue"),
        t("studyStats.wed"),
        t("studyStats.thu"),
        t("studyStats.fri"),
        t("studyStats.sat"),
    ];
    const today = startOfDay(new Date());
    const buckets: DayBucket[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        buckets.push({
            key: toKey(date),
            label: dayLabels[date.getDay()],
            date,
            minutes: 0,
            isToday: toKey(date) === toKey(today),
        });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const s of sessions) {
        if (s.type !== "FOCUS") continue;
        const day = byKey.get(toKey(startOfDay(new Date(s.startTime))));
        if (day) {
            day.minutes += s.durationMinutes;
        }
    }
    return buckets;
}

/** Consecutive days (ending today or yesterday) with >= 1 focus minute. */
function computeStreak(sessions: StudySession[]): number {
    const days = new Set<string>();
    for (const s of sessions) {
        if (s.type !== "FOCUS" || s.durationMinutes <= 0) continue;
        days.add(toKey(startOfDay(new Date(s.startTime))));
    }
    let streak = 0;
    const cursor = startOfDay(new Date());
    // Allow the streak to count if today has no session yet but yesterday did.
    if (!days.has(toKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!days.has(toKey(cursor))) return 0;
    }
    while (days.has(toKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

function formatDuration(totalMinutes: number, t: (k: string) => string): string {
    if (totalMinutes <= 0) return `0 ${t("studyStats.minutes")}`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours <= 0) return `${mins} ${t("studyStats.minutes")}`;
    return `${hours} ${t("studyStats.hours")} ${mins} ${t("studyStats.minutes")}`;
}

export default function StudyStatsPage() {
    const { t } = useTranslation();
    const query = useQuery<StudySession[]>({
        queryKey: ["studySessionsWeekly"],
        queryFn: () => getWeeklyStudySessions().then((r) => r.data),
    });

    const sessions = query.data ?? [];
    const buckets = useMemo(() => buildWeek(sessions, t), [sessions, t]);
    const totalMinutes = useMemo(
        () => sessions.filter((s) => s.type === "FOCUS").reduce((sum, s) => sum + s.durationMinutes, 0),
        [sessions],
    );
    const activeDays = buckets.filter((b) => b.minutes > 0).length;
    const avgPerDay = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
    const streak = useMemo(() => computeStreak(sessions), [sessions]);
    const maxMinutes = Math.max(1, ...buckets.map((b) => b.minutes));

    const isLoading = query.isLoading;
    const isError = query.isError;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("studyStats.title")} — LernChih`}
                description={t("studyStats.description")}
                canonicalPath="/study-stats"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <ChartMultiple24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("studyStats.title")}</h1>
                        <p className={styles.subtitle}>{t("studyStats.subtitle")}</p>
                    </div>
                </div>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<ArrowClockwise24Regular />}
                    onClick={() => query.refetch()}
                >
                    {t("common.retry")}
                </Button>
            </header>

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("studyStats.loading")}>
                    <Spinner label={t("studyStats.loading")} />
                </div>
            )}

            {isError && (
                <ErrorState
                    icon={<ChartMultiple24Regular />}
                    title={t("error.dashboardTitle")}
                    description={t("error.dashboardDescription")}
                    onRetry={() => query.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}

            {!isLoading && !isError && sessions.length === 0 && (
                <EmptyState
                    icon={<ChartMultiple24Regular />}
                    title={t("studyStats.title")}
                    description={t("studyStats.noData")}
                />
            )}

            {!isLoading && !isError && sessions.length > 0 && (
                <>
                    <div className={styles.statsRow}>
                        <Card padding="lg" className={styles.statCard}>
                            <p className={styles.statLabel}>{t("studyStats.totalTime")}</p>
                            <p className={styles.statValue}>
                                {formatDuration(totalMinutes, t)}
                            </p>
                        </Card>
                        <Card padding="lg" className={styles.statCard}>
                            <p className={styles.statLabel}>{t("studyStats.avgPerDay")}</p>
                            <p className={styles.statValue}>
                                {formatDuration(avgPerDay, t)}
                            </p>
                        </Card>
                        <Card padding="lg" className={styles.statCard}>
                            <p className={styles.statLabel}>{t("studyStats.streak")}</p>
                            <p className={styles.statValue}>
                                {streak} <span className={styles.statUnit}>{t("studyStats.days")}</span>
                            </p>
                        </Card>
                    </div>

                    <Card padding="lg" className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>{t("studyStats.thisWeek")}</h2>
                        </div>
                        <svg
                            className={styles.chart}
                            viewBox="0 0 700 260"
                            role="img"
                            aria-label={t("studyStats.thisWeek")}
                        >
                            {/* Baseline */}
                            <line
                                className={styles.baseline}
                                x1="40"
                                y1="220"
                                x2="680"
                                y2="220"
                            />
                            {buckets.map((b, i) => {
                                const barWidth = 60;
                                const gap = (640 - barWidth * 7) / 6;
                                const x = 40 + i * (barWidth + gap);
                                const height = (b.minutes / maxMinutes) * 180;
                                const y = 220 - height;
                                return (
                                    <g key={b.key}>
                                        <rect
                                            className={b.isToday ? styles.barToday : styles.bar}
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={Math.max(height, 2)}
                                            rx="6"
                                        >
                                            <title>
                                                {b.label}: {b.minutes} {t("studyStats.minutes")}
                                            </title>
                                        </rect>
                                        <text
                                            className={styles.barValue}
                                            x={x + barWidth / 2}
                                            y={y - 6}
                                            textAnchor="middle"
                                        >
                                            {b.minutes > 0 ? b.minutes : ""}
                                        </text>
                                        <text
                                            className={styles.axisLabel}
                                            x={x + barWidth / 2}
                                            y="240"
                                            textAnchor="middle"
                                        >
                                            {b.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </Card>
                </>
            )}
        </div>
    );
}
