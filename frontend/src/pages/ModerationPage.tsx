import { useState } from "react";
import {
    makeStyles,
    tokens,
    Title2,
    Title3,
    Subtitle2,
    Body1,
    Badge,
    Button,
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridCell,
    DataGridBody,
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

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "1000px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    filterRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "center",
    },
});

const STATUS_OPTIONS = ["PENDING", "RESOLVED", "DISMISSED"];

export default function ModerationPage() {
    const { t } = useTranslation();
    const styles = useStyles();
    const user = useAuthStore((s) => s.user);
    const [statusFilter, setStatusFilter] = useState<string>("");
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

    const columns = [
        { columnId: "id", renderHeaderCell: () => t("admin.id") as string, minWidth: 60 },
        {
            columnId: "reporter",
            renderHeaderCell: () => t("admin.reporter") as string,
            minWidth: 120,
        },
        { columnId: "target", renderHeaderCell: () => t("admin.target") as string, minWidth: 150 },
        { columnId: "reason", renderHeaderCell: () => t("admin.reason") as string, minWidth: 200 },
        { columnId: "status", renderHeaderCell: () => t("admin.status") as string, minWidth: 100 },
        {
            columnId: "actions",
            renderHeaderCell: () => t("admin.actions") as string,
            minWidth: 200,
        },
    ];

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
        <div className={styles.container}>
            <Seo
                title={`${t("admin.moderationTitle")} — LernChih`}
                canonicalPath="/moderation"
                robots="noindex, nofollow"
            />
            <div className={styles.headerRow}>
                <Shield24Regular />
                <Title2 as="h1">{t("admin.moderationTitle")}</Title2>
            </div>

            <div className={styles.filterRow}>
                <Dropdown
                    placeholder={t("admin.filterByStatus")}
                    value={statusFilter || undefined}
                    selectedOptions={statusFilter ? [statusFilter] : []}
                    onOptionSelect={(_: unknown, d: { optionValue?: string }) =>
                        setStatusFilter(d.optionValue || "")
                    }
                    clearable
                >
                    {STATUS_OPTIONS.map((s) => (
                        <Option key={s} value={s}>
                            {t(`status.${s.toLowerCase()}`)}
                        </Option>
                    ))}
                </Dropdown>
            </div>

            {isLoading && <SkeletonList count={4} />}
            {isError && (
                <div role="alert" style={{ textAlign: "center", padding: 48 }}>
                    <Title3 as="h3">{t("admin.loadError")}</Title3>
                    <p style={{ marginBottom: 12 }}>{t("errors.generic")}</p>
                    <Button appearance="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && reports.length === 0 && (
                <MessageBar>
                    <MessageBarBody>{t("admin.noReports")}</MessageBarBody>
                </MessageBar>
            )}

            {!isLoading && reports.length > 0 && (
                <DataGrid items={reports} columns={columns as any} style={{ minWidth: "800px" }}>
                    <DataGridHeader>
                        <DataGridRow>
                            {({ renderHeaderCell }) => (
                                <DataGridCell>{renderHeaderCell()}</DataGridCell>
                            )}
                        </DataGridRow>
                    </DataGridHeader>
                    <DataGridBody>
                        {({ item, rowId }: { item: Report; rowId: any }) => (
                            <DataGridRow key={rowId}>
                                {({ columnId }) => {
                                    if (columnId === "id") {
                                        return (
                                            <DataGridCell>
                                                <Body1>{item.id}</Body1>
                                            </DataGridCell>
                                        );
                                    }
                                    if (columnId === "reporter") {
                                        return (
                                            <DataGridCell>
                                                <Body1>
                                                    {item.reporterName || t("common.unknown")}
                                                </Body1>
                                            </DataGridCell>
                                        );
                                    }
                                    if (columnId === "target") {
                                        return (
                                            <DataGridCell>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                    }}
                                                >
                                                    <Badge appearance="outline" size="small">
                                                        {item.targetType ||
                                                            t("common.notApplicable")}
                                                    </Badge>
                                                    <Body1>
                                                        {item.targetTitle ||
                                                            item.targetId ||
                                                            t("common.notApplicable")}
                                                    </Body1>
                                                </div>
                                            </DataGridCell>
                                        );
                                    }
                                    if (columnId === "reason") {
                                        return (
                                            <DataGridCell>
                                                <Body1>{item.reason || t("common.noReason")}</Body1>
                                            </DataGridCell>
                                        );
                                    }
                                    if (columnId === "status") {
                                        const color =
                                            item.status === "RESOLVED"
                                                ? "success"
                                                : item.status === "PENDING"
                                                  ? "warning"
                                                  : "informative";
                                        return (
                                            <DataGridCell>
                                                <Badge
                                                    appearance="tint"
                                                    color={color}
                                                    icon={statusIcon(item.status)}
                                                >
                                                    {t(`status.${item.status.toLowerCase()}`)}
                                                </Badge>
                                            </DataGridCell>
                                        );
                                    }
                                    if (columnId === "actions") {
                                        return (
                                            <DataGridCell>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    {item.status === "PENDING" && (
                                                        <Button
                                                            appearance="subtle"
                                                            icon={<Checkmark24Regular />}
                                                            size="small"
                                                            onClick={() => handleResolve(item.id)}
                                                        >
                                                            {t("admin.resolve")}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        appearance="subtle"
                                                        icon={<Delete24Regular />}
                                                        size="small"
                                                        color="danger"
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
                                            </DataGridCell>
                                        );
                                    }
                                    return <DataGridCell>-</DataGridCell>;
                                }}
                            </DataGridRow>
                        )}
                    </DataGridBody>
                </DataGrid>
            )}

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setDeleteDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("admin.confirmDeleteTitle")}</DialogTitle>
                        <DialogContent>
                            <Body1>
                                {t("admin.confirmDeleteContent", {
                                    type: deleteTarget?.type?.toLowerCase() || t("common.content"),
                                })}
                            </Body1>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                appearance="secondary"
                                onClick={() => setDeleteDialogOpen(false)}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                appearance="primary"
                                color="danger"
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
