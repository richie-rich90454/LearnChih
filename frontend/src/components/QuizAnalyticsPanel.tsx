import { Spinner } from "@fluentui/react-components";
import { ChartMultiple24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useQuizAnalytics } from "../hooks/useQuizzes";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { EmptyState } from "./EmptyState";
import styles from "./QuizAnalyticsPanel.module.css";

/**
 * Per-question analytics panel (F17). Renders difficulty (correct-rate) and
 * discrimination (score-gap between correct/wrong responders) for each
 * question in a quiz, so authors can spot questions that are too hard or
 * fail to distinguish strong from weak learners.
 */
export default function QuizAnalyticsPanel({
    quizId,
}: {
    quizId: string | number;
}) {
    const { t } = useTranslation();
    const { data: analytics, isLoading } = useQuizAnalytics(quizId);

    if (isLoading) {
        return (
            <div className={styles.loading} role="status" aria-live="polite">
                <Spinner size="tiny" aria-hidden="true" />
                <span>{t("quizzes.analyticsLoading")}</span>
            </div>
        );
    }

    if (!analytics || analytics.questions.length === 0) {
        return (
            <EmptyState
                icon={<ChartMultiple24Regular />}
                title={t("quizzes.analyticsEmpty")}
                description={t("quizzes.analyticsEmptyDescription")}
            />
        );
    }

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <ChartMultiple24Regular className={styles.icon} aria-hidden />
                <h2 className={styles.title}>{t("quizzes.analyticsTitle")}</h2>
            </div>
            <div className={styles.list}>
                {analytics.questions.map((q, i) => {
                    const diffPct = Math.round(q.difficulty * 100);
                    const disc = q.discrimination;
                    const discVariant =
                        disc > 0.5 ? "success" : disc < 0 ? "danger" : "neutral";
                    return (
                        <div key={q.questionId} className={styles.row}>
                            <div className={styles.rowHead}>
                                <span className={styles.qLabel}>
                                    {t("quizzes.questionLabel")} {i + 1}
                                </span>
                                <Badge variant={discVariant} size="small">
                                    {t("quizzes.discrimination", {
                                        value: disc.toFixed(2),
                                    })}
                                </Badge>
                            </div>
                            <p className={styles.qText}>{q.question}</p>
                            <div className={styles.bar}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${diffPct}%` }}
                                />
                            </div>
                            <div className={styles.meta}>
                                <span>
                                    {t("quizzes.difficulty", { pct: diffPct })}
                                </span>
                                <span>
                                    {t("quizzes.attempts", {
                                        count: q.timesAttempted,
                                    })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
