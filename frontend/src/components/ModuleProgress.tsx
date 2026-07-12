import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import {
    getCourseProgress,
    completeModule,
    type CourseProgress,
} from "../api/courseProgress";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import styles from "./ModuleProgress.module.css";

function formatDate(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
}

/**
 * Course module completion tracker (F3). Renders a course's ordered modules
 * with a progress bar and per-module mark-complete actions. Completion state
 * is sourced from /api/courses/{courseId}/progress and mutated in place.
 */
export default function ModuleProgress({ courseId }: { courseId: number }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const queryKey = ["course-progress", courseId] as const;

    const progressQuery = useQuery<CourseProgress>({
        queryKey: queryKey,
        queryFn: () => getCourseProgress(courseId).then((r) => r.data),
    });

    const completeMutation = useMutation({
        mutationFn: (moduleId: number) => completeModule(courseId, moduleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const data = progressQuery.data;
    const completed = data?.completedCount ?? 0;
    const total = data?.totalModules ?? 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (progressQuery.isLoading) {
        return <div role="status" aria-live="polite" aria-label={t("moduleProgress.loading")}><Spinner label={t("moduleProgress.loading")} /></div>;
    }

    if (progressQuery.isError) {
        return (
            <MessageBar intent="error">
                <MessageBarBody>{t("common.error")}</MessageBarBody>
            </MessageBar>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>
                        {data.courseName ?? t("resources.course")}
                    </h2>
                    <p className={styles.subtitle}>{t("moduleProgress.title")}</p>
                </div>
                <span className={styles.summary}>
                    {t("moduleProgress.completedCount", { completed, total })}
                </span>
            </div>

            <div
                className={styles.progressBar}
                role="progressbar"
                aria-valuenow={completed}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={t("moduleProgress.completedCount", { completed, total })}
            >
                <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%` }}
                />
            </div>

            <ul className={styles.moduleList}>
                {data.modules.map((item, idx) => {
                    const pending =
                        completeMutation.isPending &&
                        completeMutation.variables === item.module.id;
                    return (
                        <li key={item.module.id} className={styles.moduleRow}>
                            <span className={styles.moduleIndex}>{idx + 1}</span>
                            <div className={styles.moduleInfo}>
                                <span className={styles.moduleTitle}>
                                    {item.module.title}
                                </span>
                                {item.module.durationMinutes ? (
                                    <span className={styles.moduleMeta}>
                                        {item.module.durationMinutes}m
                                    </span>
                                ) : null}
                            </div>
                            <div className={styles.moduleStatus}>
                                {item.completed ? (
                                    <div className={styles.completedBlock}>
                                        <Badge variant="success" size="small">
                                            {t("moduleProgress.completed")}
                                        </Badge>
                                        {item.completedAt && (
                                            <span className={styles.completedDate}>
                                                {t("moduleProgress.completedOn", {
                                                    date: formatDate(item.completedAt),
                                                })}
                                            </span>
                                        )}
                                        {item.score != null && (
                                            <span className={styles.scoreText}>
                                                {t("moduleProgress.score", {
                                                    score: item.score,
                                                })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={() =>
                                            completeMutation.mutate(item.module.id)
                                        }
                                        loading={pending}
                                    >
                                        {t("moduleProgress.markComplete")}
                                    </Button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
