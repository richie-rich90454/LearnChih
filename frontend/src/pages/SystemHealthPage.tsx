import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    Database24Regular,
    HardDrive24Regular,
    Hourglass24Regular,
    People24Regular,
} from "@fluentui/react-icons";
import { MessageBar, MessageBarBody, Spinner } from "@fluentui/react-components";
import useAuthStore from "@/store/authStore";
import { getSystemHealth, type SystemHealth } from "@/api/systemHealth";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./SystemHealthPage.module.css";

const REFRESH_INTERVAL_MS = 30_000;

function formatUptime(ms: number): string {
    if (!Number.isFinite(ms) || ms <= 0) return "—";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
}

export default function SystemHealthPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery<SystemHealth>({
        queryKey: ["system-health"],
        queryFn: () => getSystemHealth().then((r) => r.data),
        refetchInterval: REFRESH_INTERVAL_MS,
        refetchOnWindowFocus: true,
    });

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("systemHealth.title")} — LernChih`}
                    canonicalPath="/admin/health"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const memoryPct =
        data && data.memoryMaxMb > 0
            ? Math.min(100, Math.round((data.memoryUsedMb / data.memoryMaxMb) * 100))
            : 0;

    const isDbUp = data?.dbStatus?.toUpperCase() === "UP";

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("systemHealth.title")} — LernChih`}
                canonicalPath="/admin/health"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Database24Regular />
                </span>
                <h1 className={styles.title}>{t("systemHealth.title")}</h1>
            </header>
            <p className={styles.subtitle}>{t("systemHealth.subtitle")}</p>

            <div className={styles.refreshRow}>
                {isLoading ? (
                    <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                        <Spinner size="tiny" />
                    </div>
                ) : (
                    <Button variant="outline" size="small" onClick={() => refetch()}>
                        {t("common.retry")}
                    </Button>
                )}
                {dataUpdatedAt ? (
                    <span>
                        {t("systemHealth.lastUpdated")}:{" "}
                        {new Date(dataUpdatedAt).toLocaleTimeString()}
                    </span>
                ) : null}
                <span>{t("systemHealth.autoRefresh")}</span>
            </div>

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("systemHealth.loadError")}</h2>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {data && !isError && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon} aria-hidden="true">
                                <Database24Regular />
                            </span>
                            {t("systemHealth.dbStatus")}
                        </div>
                        <span
                            className={`${styles.statusDot} ${
                                isDbUp ? "" : styles.statusDotDown
                            }`}
                        >
                            {isDbUp ? "● UP" : "● DOWN"}
                        </span>
                        <p className={styles.cardMeta}>
                            {t("systemHealth.activeUsers")}:{" "}
                            {data.activeUserCount >= 0
                                ? formatNumber(data.activeUserCount)
                                : t("common.unknown")}
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon} aria-hidden="true">
                                <HardDrive24Regular />
                            </span>
                            {t("systemHealth.memory")}
                        </div>
                        <p className={styles.cardValue}>
                            {formatNumber(data.memoryUsedMb)} / {formatNumber(data.memoryMaxMb)} MB
                        </p>
                        <div
                            className={styles.barWrap}
                            role="progressbar"
                            aria-valuenow={memoryPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={t("systemHealth.memory")}
                        >
                            <div className={styles.barFill} style={{ width: `${memoryPct}%` }} />
                        </div>
                        <p className={styles.cardMeta}>{memoryPct}% {t("systemHealth.used")}</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon} aria-hidden="true">
                                <HardDrive24Regular />
                            </span>
                            {t("systemHealth.disk")}
                        </div>
                        <p className={styles.cardValue}>{formatNumber(data.diskFreeGb)} GB</p>
                        <p className={styles.cardMeta}>{t("systemHealth.diskFree")}</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon} aria-hidden="true">
                                <Hourglass24Regular />
                            </span>
                            {t("systemHealth.uptime")}
                        </div>
                        <p className={styles.cardValue}>{formatUptime(data.uptimeMs)}</p>
                        <Badge variant="neutral">{t("systemHealth.sinceBoot")}</Badge>
                    </div>
                </div>
            )}

            {data && (
                <div className={styles.refreshRow}>
                    <People24Regular />
                    <span>
                        {t("systemHealth.activeUsers")}:{" "}
                        {data.activeUserCount >= 0
                            ? formatNumber(data.activeUserCount)
                            : t("common.unknown")}
                    </span>
                </div>
            )}
        </div>
    );
}
