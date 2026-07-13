import { useState } from "react";
import {
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridCell,
    DataGridBody,
    Dropdown,
    Option,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import {
    DocumentSearch24Regular,
    Search24Regular,
    Person24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { AuditLogEntry } from "@/api/auditLog";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import styles from "./AuditLogPage.module.css";

const PAGE_SIZE = 50;

const ACTION_OPTIONS = [
    "ROLE_CHANGE",
    "STATUS_CHANGE",
    "BULK_ACTION",
    "USER_DELETE",
    "FEATURE_FLAG_TOGGLE",
    "MAINTENANCE_BANNER",
] as const;

function actionBadgeVariant(action: string): BadgeVariant {
    if (action.includes("DELETE")) return "danger";
    if (action.includes("TOGGLE") || action.includes("CHANGE")) return "accent";
    return "neutral";
}

export default function AuditLogPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [actionFilter, setActionFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const debouncedSearch = useDebounce(search, 350);

    const effectiveAction = actionFilter || (debouncedSearch.trim() || undefined);
    const { data, isLoading, isError, refetch } = useAuditLog({
        action: effectiveAction,
        page,
        size: PAGE_SIZE,
    });

    const isAdmin = user?.role === "ADMIN";

    const columns = [
        { columnId: "id", renderHeaderCell: () => t("auditLog.colId") as string },
        { columnId: "actor", renderHeaderCell: () => t("auditLog.colActor") as string },
        { columnId: "action", renderHeaderCell: () => t("auditLog.colAction") as string },
        { columnId: "target", renderHeaderCell: () => t("auditLog.colTarget") as string },
        { columnId: "ip", renderHeaderCell: () => t("auditLog.colIp") as string },
        { columnId: "time", renderHeaderCell: () => t("auditLog.colTime") as string },
    ];

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("auditLog.title")} — LernChih`}
                    canonicalPath="/admin/audit-log"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const entries = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("auditLog.title")} — LernChih`}
                canonicalPath="/admin/audit-log"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <DocumentSearch24Regular />
                </span>
                <h1 className={styles.title}>{t("auditLog.title")}</h1>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.toolbarSearch}>
                    <Input
                        value={search}
                        onChange={(_, d) => {
                            setSearch(d.value);
                            setPage(0);
                        }}
                        placeholder={t("auditLog.searchPlaceholder")}
                        contentBefore={<Search24Regular />}
                        aria-label={t("common.search")}
                    />
                </div>
                <div className={styles.toolbarFilter}>
                    <Dropdown
                        placeholder={t("auditLog.filterByAction")}
                        value={actionFilter || undefined}
                        selectedOptions={actionFilter ? [actionFilter] : []}
                        onOptionSelect={(_, d) => {
                            setActionFilter(d.optionValue || "");
                            setPage(0);
                        }}
                        clearable
                        aria-label={t("auditLog.filterByAction")}
                    >
                        {ACTION_OPTIONS.map((a) => (
                            <Option key={a} value={a}>
                                {a}
                            </Option>
                        ))}
                    </Dropdown>
                </div>
            </div>

            {isLoading && <SkeletonList count={6} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("auditLog.loadError")}</h2>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && entries.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Person24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("auditLog.noEntries")}</p>
                </div>
            )}

            {!isLoading && !isError && entries.length > 0 && (
                <div className={styles.table}>
                    <DataGrid
                        items={entries}
                        columns={columns as any}
                        getRowId={(item: AuditLogEntry) => item.id}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridCell>{renderHeaderCell()}</DataGridCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody>
                            {({ item }: { item: AuditLogEntry }) => (
                                <DataGridRow key={item.id}>
                                    {({ columnId }) => {
                                        if (columnId === "id") {
                                            return (
                                                <DataGridCell>#{item.id}</DataGridCell>
                                            );
                                        }
                                        if (columnId === "actor") {
                                            return (
                                                <DataGridCell>
                                                    {item.actorId ?? t("common.unknown")}
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "action") {
                                            return (
                                                <DataGridCell>
                                                    <Badge
                                                        variant={actionBadgeVariant(item.action)}
                                                        size="small"
                                                    >
                                                        {item.action}
                                                    </Badge>
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "target") {
                                            return (
                                                <DataGridCell>
                                                    {item.targetType
                                                        ? `${item.targetType} #${item.targetId}`
                                                        : t("common.notApplicable")}
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "ip") {
                                            return (
                                                <DataGridCell>
                                                    {item.ipAddress || t("common.notApplicable")}
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "time") {
                                            return (
                                                <DataGridCell>
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </DataGridCell>
                                            );
                                        }
                                        return <DataGridCell>-</DataGridCell>;
                                    }}
                                </DataGridRow>
                            )}
                        </DataGridBody>
                    </DataGrid>
                </div>
            )}

            <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
            />
        </div>
    );
}
