import { useMemo, useState } from "react";
import {
    Dropdown,
    Option,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import {
    Shield24Regular,
    Checkmark24Regular,
    Delete24Regular,
    Clock24Regular,
    Dismiss24Regular,
    Search24Regular,
} from "@fluentui/react-icons";
import {
    useReports,
    useResolveReport,
    useDeleteResourceAdmin,
    useDeletePostAdmin,
} from "@/hooks/useReports";
import useAuthStore from "@/store/authStore";
import { useTranslation } from "react-i18next";
import type { Report } from "@/types";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./Admin.module.css";

const STATUS_OPTIONS = ["PENDING", "RESOLVED", "DISMISSED"];

function statusBadgeVariant(status: Report["status"]): BadgeVariant {
    if (status === "RESOLVED") return "success";
    if (status === "PENDING") return "warning";
    return "neutral";
}

export default function ModerationPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: string } | null>(null);

    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;

    const { data, isLoading, isError, refetch } = useReports(params);
    const resolveReport = useResolveReport();
    const deleteResource = useDeleteResourceAdmin();
    const deletePost = useDeletePostAdmin();

    const isModerator = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const reports: Report[] = Array.isArray(data) ? data : (data as any)?.content || [];

    // Client-side search over the already-fetched reports (no backend call).
    const filteredReports = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return reports;
        return reports.filter((r) =>
            [r.reason, r.reporterName, r.targetTitle, String(r.targetId)]
                .filter((v): v is string => Boolean(v))
                .some((v) => v.toLowerCase().includes(q)),
        );
    }, [reports, query]);

    const statusIcon = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return <Checkmark24Regular />;
            case "DISMISSED":
                return <Dismiss24Regular />;
            default:
                return <Clock24Regular />;
        }
    };

    const handleResolve = (id: number) => {
        resolveReport.mutate(id);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "RESOURCE") {
            deleteResource.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteDialogOpen(false),
            });
        } else if (
            deleteTarget.type === "POST" ||
            deleteTarget.type === "RESOURCE_POST" ||
            deleteTarget.type === "CHANNEL_POST"
        ) {
            deletePost.mutate(deleteTarget.id, {
                onSuccess: () => setDeleteDialogOpen(false),
            });
        }
    };

    if (!isModerator) {
        return (
            <>
                <Seo
                    title={`${t("admin.moderationTitle")} — LernChih`}
                    canonicalPath="/moderation"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("admin.moderationTitle")} — LernChih`}
                canonicalPath="/moderation"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Shield24Regular />
                </span>
                <h1 className={styles.title}>{t("admin.moderationTitle")}</h1>
            </header>

            {/* Toolbar: client-side search + status filter. */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarSearch}>
                    <Input
                        value={query}
                        onChange={(_, d) => setQuery(d.value)}
                        placeholder={t("common.searchPlaceholder")}
                        contentBefore={<Search24Regular />}
                        aria-label={t("common.search")}
                    />
                </div>
                <div className={styles.toolbarFilter}>
                    <Dropdown
                        placeholder={t("admin.filterByStatus")}
                        value={statusFilter || undefined}
                        selectedOptions={statusFilter ? [statusFilter] : []}
                        onOptionSelect={(_: unknown, d: { optionValue?: string }) =>
                            setStatusFilter(d.optionValue || "")
                        }
                        clearable
                        aria-label={t("admin.filterByStatus")}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <Option key={s} value={s}>
                                {t(`status.${s.toLowerCase()}`)}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
            </div>

            {isLoading && <SkeletonList count={4} />}
            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("admin.loadError")}</h2>
                    <p className={styles.errorText}>{t("errors.generic")}</p>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && filteredReports.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Clock24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("admin.noReports")}</p>
                </div>
            )}

            {!isLoading && !isError && filteredReports.length > 0 && (
                <ul className={styles.queue}>
                    {filteredReports.map((item) => (
                        <li key={item.id}>
                            <Card padding="lg" className={styles.queueItem}>
                                <div className={styles.queueHead}>
                                    <div>
                                        <div className={styles.queueMeta}>
                                            <Badge variant="neutral" size="small">
                                                {item.targetType || t("common.notApplicable")}
                                            </Badge>
                                            <span>#{item.id}</span>
                                            <span>
                                                {t("admin.reporter")}:{" "}
                                                {item.reporterName || t("common.unknown")}
                                            </span>
                                        </div>
                                        <p className={styles.queueTarget}>
                                            {item.targetTitle ||
                                                item.targetId ||
                                                t("common.notApplicable")}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={statusBadgeVariant(item.status)}
                                        className={styles.queueStatus}
                                        icon={statusIcon(item.status)}
                                    >
                                        {t(`status.${item.status.toLowerCase()}`)}
                                    </Badge>
                                </div>
                                <p className={styles.queueReason}>
                                    {t("admin.reason")}: {item.reason || t("common.noReason")}
                                </p>
                                <div className={styles.queueActions}>
                                    {item.status === "PENDING" && (
                                        <Button
                                            variant="subtle"
                                            size="small"
                                            icon={<Checkmark24Regular />}
                                            onClick={() => handleResolve(item.id)}
                                        >
                                            {t("admin.resolve")}
                                        </Button>
                                    )}
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => {
                                            setDeleteTarget({
                                                id: item.targetId,
                                                type: item.targetType,
                                            });
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        {t("admin.delete")}
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setDeleteDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("admin.confirmDeleteTitle")}</DialogTitle>
                        <DialogContent>
                            {t("admin.confirmDeleteContent", {
                                type: deleteTarget?.type?.toLowerCase() || t("common.content"),
                            })}
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                disabled={deleteResource.isPending || deletePost.isPending}
                            >
                                {deleteResource.isPending || deletePost.isPending ? (
                                    <Spinner size="tiny" />
                                ) : (
                                    t("admin.delete")
                                )}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}
