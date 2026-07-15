import { useState } from "react";
import {
    Dropdown,
    Option,
    MessageBar,
    MessageBarBody,
    Spinner,
} from "@fluentui/react-components";
import {
    Shield24Regular,
    Checkmark24Regular,
    Dismiss24Regular,
    PersonTag24Regular,
    Clock24Regular,
    Warning24Regular,
    ClockAlarm24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import {
    useModerationQueue,
    useAssignModerationItem,
    useResolveModerationItem,
    useDismissModerationItem,
} from "@/hooks/useModerationQueue";
import type { ModerationItem, ModerationStatus } from "@/api/moderationQueue";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import styles from "./ModerationQueuePage.module.css";

const STATUS_OPTIONS: ModerationStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];
const PAGE_SIZE = 20;

function statusBadgeVariant(status: ModerationStatus): BadgeVariant {
    if (status === "RESOLVED") return "success";
    if (status === "PENDING") return "warning";
    return "neutral";
}

type SlaState = "overdue" | "dueSoon" | "onTrack" | "closed";

function getSlaState(item: ModerationItem): SlaState {
    if (item.status !== "PENDING") return "closed";
    const deadline = new Date(item.slaDeadline).getTime();
    const now = Date.now();
    if (deadline < now) return "overdue";
    if (deadline < now + 4 * 60 * 60 * 1000) return "dueSoon";
    return "onTrack";
}

function formatTimeRemaining(slaDeadline: string): string {
    const diff = new Date(slaDeadline).getTime() - Date.now();
    if (diff <= 0) return "";
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours >= 1) return `${hours}h`;
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
}

export default function ModerationQueuePage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [page, setPage] = useState(0);

    const { data, isLoading, isError, refetch } = useModerationQueue({
        status: (statusFilter || undefined) as ModerationStatus | undefined,
        page,
        size: PAGE_SIZE,
    });
    const assignItem = useAssignModerationItem();
    const resolveItem = useResolveModerationItem();
    const dismissItem = useDismissModerationItem();

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("moderationQueue.title")} — LernChih`}
                    canonicalPath="/admin/moderation"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const items = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const anyPending =
        assignItem.isPending || resolveItem.isPending || dismissItem.isPending;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("moderationQueue.title")} — LernChih`}
                canonicalPath="/admin/moderation"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Shield24Regular />
                </span>
                <h1 className={styles.title}>{t("moderationQueue.title")}</h1>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.toolbarFilter}>
                    <Dropdown
                        placeholder={t("moderationQueue.filterByStatus")}
                        value={statusFilter || undefined}
                        selectedOptions={statusFilter ? [statusFilter] : []}
                        onOptionSelect={(_, d) => {
                            setStatusFilter(d.optionValue || "");
                            setPage(0);
                        }}
                        clearable
                        aria-label={t("moderationQueue.filterByStatus")}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <Option key={s} value={s}>
                                {t(`status.${s.toLowerCase()}`)}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
                {anyPending && (
                    <span role="status" aria-live="polite" aria-label={t("common.loading")}>
                        <Spinner size="tiny" aria-hidden="true" />
                    </span>
                )}
            </div>

            {isLoading && <SkeletonList count={4} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("moderationQueue.loadError")}</h2>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && items.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Clock24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("moderationQueue.noItems")}</p>
                </div>
            )}

            {!isLoading && !isError && items.length > 0 && (
                <ul className={styles.queue}>
                    {items.map((item) => {
                        const slaState = getSlaState(item);
                        const timeRemaining = formatTimeRemaining(item.slaDeadline);
                        return (
                            <li key={item.id}>
                                <Card padding="lg" className={styles.queueItem}>
                                    <div className={styles.queueHead}>
                                        <div>
                                            <div className={styles.queueMeta}>
                                                <Badge variant="neutral" size="small">
                                                    {item.contentType}
                                                </Badge>
                                                <span>#{item.id}</span>
                                                <span>
                                                    {t("moderationQueue.reporter")}:{" "}
                                                    {item.reportedBy ?? t("common.unknown")}
                                                </span>
                                            </div>
                                            <p className={styles.queueTarget}>
                                                {item.contentType} #{item.contentId}
                                            </p>
                                        </div>
                                        <div className={styles.queueBadges}>
                                            <Badge
                                                variant={statusBadgeVariant(item.status)}
                                                size="small"
                                                className={styles.queueStatus}
                                            >
                                                {t(`status.${item.status.toLowerCase()}`)}
                                            </Badge>
                                            {slaState === "overdue" && (
                                                <Badge
                                                    variant="danger"
                                                    size="small"
                                                    icon={<Warning24Regular />}
                                                >
                                                    {t("moderationQueue.slaOverdue")}
                                                </Badge>
                                            )}
                                            {slaState === "dueSoon" && (
                                                <Badge
                                                    variant="warning"
                                                    size="small"
                                                    icon={<ClockAlarm24Regular />}
                                                >
                                                    {t("moderationQueue.slaDueSoon")}
                                                </Badge>
                                            )}
                                            {slaState === "onTrack" && timeRemaining && (
                                                <Badge
                                                    variant="neutral"
                                                    size="small"
                                                    icon={<Clock24Regular />}
                                                >
                                                    {t("moderationQueue.slaRemaining", {
                                                        time: timeRemaining,
                                                    })}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className={styles.queueReason}>
                                        {t("moderationQueue.reason")}:{" "}
                                        {item.reason || t("common.noReason")}
                                    </p>
                                    <div className={styles.queueFooter}>
                                        <span className={styles.assignedInfo}>
                                            {t("moderationQueue.assigned")}:{" "}
                                            {item.assignedTo ?? t("moderationQueue.unassigned")}
                                        </span>
                                        {item.status === "PENDING" && (
                                            <div className={styles.queueActions}>
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<PersonTag24Regular />}
                                                    disabled={anyPending}
                                                    onClick={() => assignItem.mutate(item.id)}
                                                >
                                                    {t("moderationQueue.assign")}
                                                </Button>
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<Checkmark24Regular />}
                                                    disabled={anyPending}
                                                    onClick={() => resolveItem.mutate(item.id)}
                                                >
                                                    {t("moderationQueue.resolve")}
                                                </Button>
                                                <Button
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<Dismiss24Regular />}
                                                    disabled={anyPending}
                                                    onClick={() => dismissItem.mutate(item.id)}
                                                >
                                                    {t("moderationQueue.dismiss")}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
            />
        </div>
    );
}
