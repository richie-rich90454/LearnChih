import { useTranslation } from "react-i18next";
import {
    People24Regular,
    PresenceAvailable24Regular,
    Library24Regular,
    Chat24Regular,
    Flag24Regular,
    PersonAdd24Regular,
    ArrowUp24Regular,
    ArrowDown24Regular,
} from "@fluentui/react-icons";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Card } from "@/components/ui/Card";
import { SkeletonList } from "@/components/Skeleton";
import styles from "./AdminKpis.module.css";

type Trend = "up" | "down" | undefined;

interface KpiConfig {
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    trend: Trend;
    hint?: string;
}

/**
 * KPI summary cards for the admin dashboard. Fetches aggregate counts from
 * /api/admin/stats and renders a responsive grid of metric cards with trend
 * indicators. Mounted at the top of AdminPage.
 */
export default function AdminKpis() {
    const { t } = useTranslation();
    const { data, isLoading, isError, refetch } = useAdminStats();

    if (isLoading) {
        return <SkeletonList count={3} />;
    }

    if (isError || !data) {
        return (
            <div role="alert" className={styles.errorState}>
                <p className={styles.errorText}>{t("admin.kpisLoadError")}</p>
                <button type="button" className={styles.retry} onClick={() => refetch()}>
                    {t("errors.retry")}
                </button>
            </div>
        );
    }

    const kpis: KpiConfig[] = [
        {
            key: "totalUsers",
            label: t("admin.kpiTotalUsers"),
            value: data.totalUsers,
            icon: <People24Regular />,
            trend: data.newSignupsThisWeek > 0 ? "up" : undefined,
            hint:
                data.newSignupsThisWeek > 0
                    ? t("admin.kpiNewThisWeek", { count: data.newSignupsThisWeek })
                    : undefined,
        },
        {
            key: "activeUsersToday",
            label: t("admin.kpiActiveToday"),
            value: data.activeUsersToday,
            icon: <PresenceAvailable24Regular />,
            trend: data.activeUsersToday > 0 ? "up" : undefined,
        },
        {
            key: "totalResources",
            label: t("admin.kpiTotalResources"),
            value: data.totalResources,
            icon: <Library24Regular />,
            trend: undefined,
        },
        {
            key: "totalPosts",
            label: t("admin.kpiTotalPosts"),
            value: data.totalPosts,
            icon: <Chat24Regular />,
            trend: undefined,
        },
        {
            key: "pendingReports",
            label: t("admin.kpiPendingReports"),
            value: data.pendingReports,
            icon: <Flag24Regular />,
            trend: data.pendingReports > 0 ? "down" : undefined,
            hint:
                data.pendingReports > 0
                    ? t("admin.kpiNeedsAttention")
                    : t("admin.kpiAllClear"),
        },
        {
            key: "newSignupsThisWeek",
            label: t("admin.kpiNewSignups"),
            value: data.newSignupsThisWeek,
            icon: <PersonAdd24Regular />,
            trend: data.newSignupsThisWeek > 0 ? "up" : undefined,
            hint: t("admin.kpiLastSevenDays"),
        },
    ];

    return (
        <ul className={styles.grid} aria-label={t("admin.kpiSection")}>
            {kpis.map((kpi) => (
                <li key={kpi.key}>
                    <Card padding="md" className={styles.card}>
                        <div className={styles.head}>
                            <span className={styles.icon} aria-hidden="true">
                                {kpi.icon}
                            </span>
                            {kpi.trend && (
                                <span
                                    className={`${styles.trend} ${
                                        kpi.trend === "up" ? styles.trendUp : styles.trendDown
                                    }`}
                                    aria-hidden="true"
                                >
                                    {kpi.trend === "up" ? (
                                        <ArrowUp24Regular className={styles.trendIcon} />
                                    ) : (
                                        <ArrowDown24Regular className={styles.trendIcon} />
                                    )}
                                </span>
                            )}
                        </div>
                        <p className={styles.label}>{kpi.label}</p>
                        <span className={styles.value}>
                            {kpi.value.toLocaleString()}
                        </span>
                        {kpi.hint && <p className={styles.hint}>{kpi.hint}</p>}
                    </Card>
                </li>
            ))}
        </ul>
    );
}
