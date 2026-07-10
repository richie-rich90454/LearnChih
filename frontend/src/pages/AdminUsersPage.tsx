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
    Spinner,
} from "@fluentui/react-components";
import {
    Shield24Regular,
    Search24Regular,
    Person24Regular,
    CheckmarkCircle24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import { useDebounce } from "@/hooks/useDebounce";
import {
    useAdminUsers,
    useUpdateUserRole,
    useUpdateUserStatus,
} from "@/hooks/useAdminUsers";
import type { AdminUserSummary, UserRole, UserStatus } from "@/api/adminUsers";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import styles from "./AdminUsersPage.module.css";

const ROLES: UserRole[] = ["STUDENT", "MODERATOR", "ADMIN"];
const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "BANNED"];
const PAGE_SIZE = 20;

function statusBadgeVariant(status: UserStatus): BadgeVariant {
    if (status === "ACTIVE") return "success";
    if (status === "SUSPENDED") return "warning";
    return "danger";
}

function roleBadgeVariant(role: UserRole): BadgeVariant {
    if (role === "ADMIN") return "accent";
    if (role === "MODERATOR") return "warning";
    return "neutral";
}

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0); // 0-indexed for Spring Data
    const debouncedSearch = useDebounce(search, 350);

    const { data, isLoading, isError, refetch } = useAdminUsers({
        search: debouncedSearch.trim() || undefined,
        page,
        size: PAGE_SIZE,
    });
    const updateRole = useUpdateUserRole();
    const updateStatus = useUpdateUserStatus();

    const isAdmin = user?.role === "ADMIN";

    const columns = [
        { columnId: "user", renderHeaderCell: () => t("adminUsers.colUser") as string },
        { columnId: "role", renderHeaderCell: () => t("adminUsers.colRole") as string },
        { columnId: "status", renderHeaderCell: () => t("adminUsers.colStatus") as string },
        { columnId: "credits", renderHeaderCell: () => t("adminUsers.colCredits") as string },
        { columnId: "verified", renderHeaderCell: () => t("adminUsers.colVerified") as string },
        { columnId: "createdAt", renderHeaderCell: () => t("adminUsers.colJoined") as string },
    ];

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("adminUsers.title")} — LernChih`}
                    canonicalPath="/admin/users"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const users = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("adminUsers.title")} — LernChih`}
                canonicalPath="/admin/users"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Shield24Regular />
                </span>
                <h1 className={styles.title}>{t("adminUsers.title")}</h1>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.toolbarSearch}>
                    <Input
                        value={search}
                        onChange={(_, d) => {
                            setSearch(d.value);
                            setPage(0);
                        }}
                        placeholder={t("adminUsers.searchPlaceholder")}
                        contentBefore={<Search24Regular />}
                        aria-label={t("common.search")}
                    />
                </div>
                {(updateRole.isPending || updateStatus.isPending) && (
                    <Spinner size="tiny" aria-label={t("common.loading")} />
                )}
            </div>

            {isLoading && <SkeletonList count={6} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h3 className={styles.errorTitle}>{t("adminUsers.loadError")}</h3>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && users.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Person24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("adminUsers.noUsers")}</p>
                </div>
            )}

            {!isLoading && !isError && users.length > 0 && (
                <div className={styles.table}>
                    <DataGrid
                        items={users}
                        columns={columns as any}
                        getRowId={(item: AdminUserSummary) => item.id}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridCell>{renderHeaderCell()}</DataGridCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody>
                            {({ item }: { item: AdminUserSummary }) => (
                                <DataGridRow key={item.id}>
                                    {({ columnId }) => {
                                        if (columnId === "user") {
                                            return (
                                                <DataGridCell>
                                                    <div className={styles.userCell}>
                                                        <span className={styles.userName}>
                                                            {item.name || t("common.unknown")}
                                                        </span>
                                                        <span className={styles.userEmail}>
                                                            {item.email}
                                                        </span>
                                                    </div>
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "role") {
                                            return (
                                                <DataGridCell>
                                                    <Dropdown
                                                        value={t(
                                                            `adminUsers.role.${item.role.toLowerCase()}`,
                                                        )}
                                                        selectedOptions={[item.role]}
                                                        onOptionSelect={(_, d) => {
                                                            const next = d.optionValue as
                                                                | UserRole
                                                                | undefined;
                                                            if (next && next !== item.role) {
                                                                updateRole.mutate({
                                                                    id: item.id,
                                                                    role: next,
                                                                });
                                                            }
                                                        }}
                                                        appearance="underline"
                                                        size="small"
                                                        aria-label={t("adminUsers.colRole")}
                                                    >
                                                        {ROLES.map((r) => (
                                                            <Option
                                                                key={r}
                                                                value={r}
                                                                text={t(
                                                                    `adminUsers.role.${r.toLowerCase()}`,
                                                                )}
                                                            >
                                                                <Badge
                                                                    variant={roleBadgeVariant(r)}
                                                                    size="small"
                                                                >
                                                                    {t(
                                                                        `adminUsers.role.${r.toLowerCase()}`,
                                                                    )}
                                                                </Badge>
                                                            </Option>
                                                        ))}
                                                    </Dropdown>
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "status") {
                                            return (
                                                <DataGridCell>
                                                    <Dropdown
                                                        value={t(
                                                            `adminUsers.status.${item.status.toLowerCase()}`,
                                                        )}
                                                        selectedOptions={[item.status]}
                                                        onOptionSelect={(_, d) => {
                                                            const next = d.optionValue as
                                                                | UserStatus
                                                                | undefined;
                                                            if (next && next !== item.status) {
                                                                updateStatus.mutate({
                                                                    id: item.id,
                                                                    status: next,
                                                                });
                                                            }
                                                        }}
                                                        appearance="underline"
                                                        size="small"
                                                        aria-label={t("adminUsers.colStatus")}
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <Option
                                                                key={s}
                                                                value={s}
                                                                text={t(
                                                                    `adminUsers.status.${s.toLowerCase()}`,
                                                                )}
                                                            >
                                                                <Badge
                                                                    variant={statusBadgeVariant(s)}
                                                                    size="small"
                                                                >
                                                                    {t(
                                                                        `adminUsers.status.${s.toLowerCase()}`,
                                                                    )}
                                                                </Badge>
                                                            </Option>
                                                        ))}
                                                    </Dropdown>
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "credits") {
                                            return (
                                                <DataGridCell>
                                                    {item.credits.toLocaleString()}
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "verified") {
                                            return (
                                                <DataGridCell>
                                                    {item.verified ? (
                                                        <CheckmarkCircle24Regular
                                                            className={styles.verifiedIcon}
                                                        />
                                                    ) : (
                                                        <span className={styles.muted}>
                                                            {t("common.notApplicable")}
                                                        </span>
                                                    )}
                                                </DataGridCell>
                                            );
                                        }
                                        if (columnId === "createdAt") {
                                            return (
                                                <DataGridCell>
                                                    {new Date(item.createdAt).toLocaleDateString()}
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
