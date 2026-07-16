import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import {
    CalendarClock24Regular,
    CheckmarkCircle24Regular,
    ArrowClockwise24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    getDueReviews,
    getUpcomingReviews,
    completeReview,
    type ReviewSchedule,
} from "../api/review";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import styles from "./ReviewCalendarPage.module.css";

interface DayCell {
    date: Date;
    key: string;
    count: number;
    isToday: boolean;
    isFuture: boolean;
    inMonth: boolean;
}

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

function buildCalendar(
    schedules: ReviewSchedule[],
    weeks: number,
): DayCell[] {
    const counts = new Map<string, number>();
    const today = startOfDay(new Date());
    for (const s of schedules) {
        const due = startOfDay(new Date(s.dueDate));
        const key = toKey(due);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    // Start the grid on the Sunday of the current week.
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    const totalDays = weeks * 7;
    const cells: DayCell[] = [];
    for (let i = 0; i < totalDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = toKey(date);
        cells.push({
            date,
            key,
            count: counts.get(key) ?? 0,
            isToday: toKey(date) === toKey(today),
            isFuture: date.getTime() > today.getTime(),
            inMonth: true,
        });
    }
    return cells;
}

function levelClass(count: number): string {
    if (count <= 0) return styles.l0;
    if (count === 1) return styles.l1;
    if (count === 2) return styles.l2;
    return styles.l3;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReviewCalendarPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [completingId, setCompletingId] = useState<number | null>(null);

    const dueQuery = useQuery<ReviewSchedule[]>({
        queryKey: ["reviewDue"],
        queryFn: () => getDueReviews().then((r) => r.data),
    });

    const upcomingQuery = useQuery<ReviewSchedule[]>({
        queryKey: ["reviewUpcoming"],
        queryFn: () => getUpcomingReviews().then((r) => r.data),
    });

    const completeMutation = useMutation({
        mutationFn: (id: number) => completeReview(id, { quality: 4 }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviewDue"] });
            queryClient.invalidateQueries({ queryKey: ["reviewUpcoming"] });
        },
    });

    const dueReviews = dueQuery.data ?? [];
    const upcoming = upcomingQuery.data ?? [];

    const cells = useMemo(() => buildCalendar(upcoming, 6), [upcoming]);

    const dueCount = dueReviews.length;
    const totalScheduled = upcoming.length;

    const handleComplete = async (id: number) => {
        setCompletingId(id);
        try {
            await completeMutation.mutateAsync(id);
        } finally {
            setCompletingId(null);
        }
    };

    const isLoading = dueQuery.isLoading || upcomingQuery.isLoading;
    const isError = dueQuery.isError || upcomingQuery.isError;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("review.title")} — LernChih`}
                description={t("review.description")}
                canonicalPath="/review"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <CalendarClock24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("review.title")}</h1>
                        <p className={styles.subtitle}>{t("review.subtitle")}</p>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{dueCount}</span>
                        <span className={styles.statLabel}>{t("review.dueToday")}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{totalScheduled}</span>
                        <span className={styles.statLabel}>{t("review.totalScheduled")}</span>
                    </div>
                </div>
            </header>

            {isError && (
                <ErrorState
                    icon={<CalendarClock24Regular />}
                    title={t("review.errorTitle")}
                    description={t("review.errorDescription")}
                    onRetry={() => {
                        dueQuery.refetch();
                        upcomingQuery.refetch();
                    }}
                    retryLabel={t("common.retry")}
                />
            )}

            {/* Due today section */}
            <section className={styles.section} aria-label={t("review.dueToday")}>
                <h2 className={styles.sectionTitle}>{t("review.dueToday")}</h2>
                {isLoading && (
                    <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                        <Spinner label={t("common.loading")} aria-hidden="true" />
                    </div>
                )}
                {!isLoading && dueCount === 0 && (
                    <EmptyState
                        icon={<CheckmarkCircle24Regular />}
                        title={t("review.allCaughtUpTitle")}
                        description={t("review.allCaughtUpDescription")}
                    />
                )}
                <div className={styles.dueGrid}>
                    {dueReviews.map((r) => (
                        <Card key={r.id} padding="md" className={styles.dueCard}>
                            <div className={styles.dueHeader}>
                                <Link
                                    to={`/resources/${r.resourceId}`}
                                    className={styles.dueTitle}
                                >
                                    {r.resourceTitle || t("common.unknown")}
                                </Link>
                                <Badge variant="warning" size="small">
                                    {t("review.due")}
                                </Badge>
                            </div>
                            <div className={styles.dueMeta}>
                                <span>{t("review.reviewCount", { count: r.reviewCount })}</span>
                                <span>{t("review.interval", { days: r.intervalDays })}</span>
                            </div>
                            <div className={styles.dueActions}>
                                <Button
                                    variant="primary"
                                    size="small"
                                    icon={<CheckmarkCircle24Regular />}
                                    loading={completingId === r.id}
                                    onClick={() => handleComplete(r.id)}
                                >
                                    {t("review.markReviewed")}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Calendar heatmap */}
            <section className={styles.section} aria-label={t("review.calendarLabel")}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t("review.upcomingTitle")}</h2>
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<ArrowClockwise24Regular />}
                        onClick={() => upcomingQuery.refetch()}
                    >
                        {t("common.retry")}
                    </Button>
                </div>
                <Card padding="md" className={styles.calendarCard}>
                    <div className={styles.weekdayRow}>
                        {WEEKDAY_LABELS.map((d) => (
                            <span key={d} className={styles.weekday}>
                                {d}
                            </span>
                        ))}
                    </div>
                    <div
                        className={styles.heatmap}
                        role="grid"
                        aria-label={t("review.calendarLabel")}
                    >
                        {cells.map((cell) => {
                            const cellLabel =
                                cell.count > 0
                                    ? t("review.cellTooltip", {
                                          count: cell.count,
                                          date: cell.date.toLocaleDateString(),
                                      })
                                    : cell.date.toLocaleDateString();
                            return (
                                <div
                                    key={cell.key}
                                    role="gridcell"
                                    className={`${styles.cell} ${levelClass(cell.count)} ${
                                        cell.isToday ? styles.cellToday : ""
                                    }`}
                                    title={cellLabel}
                                    aria-label={cellLabel}
                                >
                                    <span className={styles.cellDay} aria-hidden="true">
                                        {cell.date.getDate()}
                                    </span>
                                    {cell.count > 0 && (
                                        <span className={styles.cellCount} aria-hidden="true">
                                            {cell.count}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.legend}>
                        <span className={styles.legendLabel}>{t("review.less")}</span>
                        <span className={`${styles.legendCell} ${styles.l0}`} />
                        <span className={`${styles.legendCell} ${styles.l1}`} />
                        <span className={`${styles.legendCell} ${styles.l2}`} />
                        <span className={`${styles.legendCell} ${styles.l3}`} />
                        <span className={styles.legendLabel}>{t("review.more")}</span>
                    </div>
                </Card>
                {completeMutation.isError && (
                    <MessageBar intent="error">
                        <MessageBarBody>{t("review.completeError")}</MessageBarBody>
                    </MessageBar>
                )}
            </section>
        </div>
    );
}
