import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import {
    Shield24Regular,
    People24Regular,
    PresenceAvailable24Regular,
    Library24Regular,
    ChatMultiple24Regular,
    Chat24Regular,
    PersonAdd24Regular,
    Flag24Regular,
    ArrowUp24Regular,
    ArrowDown24Regular,
    ArrowRight24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./AdminDashboardPage.module.css";

interface KpiCard {
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    hint?: string;
}

interface BarDatum {
    label: string;
    value: number;
}

interface AdminLink {
    to: string;
    label: string;
    description: string;
}

/** Vertical bar chart rendered as inline SVG. No external charting library. */
function BarChart({ data, ariaLabel }: { data: BarDatum[]; ariaLabel: string }) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const width = 480;
    const height = 220;
    const padLeft = 40;
    const padBottom = 40;
    const padTop = 16;
    const padRight = 16;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const slot = plotW / Math.max(1, data.length);
    const barW = Math.min(48, slot * 0.6);

    // 4 horizontal gridlines for reference.
    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg
            className={styles.chart}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={ariaLabel}
            preserveAspectRatio="xMidYMid meet"
        >
            {gridLines.map((g) => {
                const y = padTop + plotH - g * plotH;
                const labelVal = Math.round(g * max);
                return (
                    <g key={g}>
                        <line
                            x1={padLeft}
                            y1={y}
                            x2={width - padRight}
                            y2={y}
                            className={styles.gridLine}
                        />
                        <text x={padLeft - 8} y={y + 4} textAnchor="end" className={styles.axisLabel}>
                            {labelVal}
                        </text>
                    </g>
                );
            })}
            {data.map((d, i) => {
                const h = (d.value / max) * plotH;
                const x = padLeft + i * slot + (slot - barW) / 2;
                const y = padTop + plotH - h;
                return (
                    <g key={d.label}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={Math.max(0, h)}
                            rx={4}
                            className={styles.bar}
                        />
                        <text
                            x={x + barW / 2}
                            y={padTop + plotH + 18}
                            textAnchor="middle"
                            className={styles.axisLabel}
                        >
                            {d.label}
                        </text>
                        <text
                            x={x + barW / 2}
                            y={y - 6}
                            textAnchor="middle"
                            className={styles.barValue}
                        >
                            {d.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/** Horizontal bar chart for relative community-health metrics. */
function HBarChart({ data, ariaLabel }: { data: BarDatum[]; ariaLabel: string }) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const rowH = 36;
    const height = data.length * rowH + 16;
    const width = 480;
    const padLeft = 120;
    const padRight = 48;

    return (
        <svg
            className={styles.chart}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={ariaLabel}
            preserveAspectRatio="xMidYMid meet"
        >
            {data.map((d, i) => {
                const y = i * rowH + 8;
                const w = ((width - padLeft - padRight) * d.value) / max;
                return (
                    <g key={d.label}>
                        <text x={padLeft - 10} y={y + 18} textAnchor="end" className={styles.axisLabel}>
                            {d.label}
                        </text>
                        <rect
                            x={padLeft}
                            y={y}
                            width={Math.max(2, w)}
                            height={20}
                            rx={4}
                            className={styles.hbar}
                        />
                        <text x={padLeft + w + 8} y={y + 15} className={styles.barValue}>
                            {d.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const { data, isLoading, isError, refetch } = useAdminDashboard();

    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const kpis: KpiCard[] = useMemo(() => {
        if (!data) return [];
        return [
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
            },
            {
                key: "totalThreads",
                label: t("adminDashboard.totalThreads"),
                value: data.totalThreads,
                icon: <ChatMultiple24Regular />,
            },
            {
                key: "totalPosts",
                label: t("admin.kpiTotalPosts"),
                value: data.totalPosts,
                icon: <Chat24Regular />,
            },
            {
                key: "newSignupsThisWeek",
                label: t("admin.kpiNewSignups"),
                value: data.newSignupsThisWeek,
                icon: <PersonAdd24Regular />,
                trend: data.newSignupsThisWeek > 0 ? "up" : undefined,
                hint: t("admin.kpiLastSevenDays"),
            },
            {
                key: "reportedContentCount",
                label: t("adminDashboard.reportedContent"),
                value: data.reportedContentCount,
                icon: <Flag24Regular />,
                trend: data.reportedContentCount > 0 ? "down" : undefined,
                hint:
                    data.reportedContentCount > 0
                        ? t("admin.kpiNeedsAttention")
                        : t("admin.kpiAllClear"),
            },
        ];
    }, [data, t]);

    const contentVolume: BarDatum[] = useMemo(() => {
        if (!data) return [];
        return [
            { label: t("adminDashboard.chartUsers"), value: data.totalUsers },
            { label: t("adminDashboard.chartResources"), value: data.totalResources },
            { label: t("adminDashboard.chartThreads"), value: data.totalThreads },
            { label: t("adminDashboard.chartPosts"), value: data.totalPosts },
        ];
    }, [data, t]);

    const engagement: BarDatum[] = useMemo(() => {
        if (!data) return [];
        return [
            { label: t("admin.kpiActiveToday"), value: data.activeUsersToday },
            { label: t("admin.kpiNewSignups"), value: data.newSignupsThisWeek },
            { label: t("adminDashboard.reportedContent"), value: data.reportedContentCount },
        ];
    }, [data, t]);

    const adminLinks: AdminLink[] = [
        {
            to: "/admin/users",
            label: t("adminDashboard.linkUsers"),
            description: t("adminDashboard.linkUsersDesc"),
        },
        {
            to: "/admin/moderation",
            label: t("adminDashboard.linkModeration"),
            description: t("adminDashboard.linkModerationDesc"),
        },
        {
            to: "/admin/audit-log",
            label: t("adminDashboard.linkAuditLog"),
            description: t("adminDashboard.linkAuditLogDesc"),
        },
        {
            to: "/admin/feature-flags",
            label: t("adminDashboard.linkFeatureFlags"),
            description: t("adminDashboard.linkFeatureFlagsDesc"),
        },
        {
            to: "/admin/health",
            label: t("adminDashboard.linkHealth"),
            description: t("adminDashboard.linkHealthDesc"),
        },
        {
            to: "/admin/api-keys",
            label: t("adminDashboard.linkApiKeys"),
            description: t("adminDashboard.linkApiKeysDesc"),
        },
        {
            to: "/admin/webhooks",
            label: t("adminDashboard.linkWebhooks", "Webhooks"),
            description: t("adminDashboard.linkWebhooksDesc", "Webhook event catalog and subscriptions"),
        },
        {
            to: "/admin/2fa-policy",
            label: t("adminDashboard.link2faPolicy", "2FA policy"),
            description: t("adminDashboard.link2faPolicyDesc", "Two-factor enforcement settings"),
        },
        {
            to: "/admin/sessions",
            label: t("adminDashboard.linkSessions", "Sessions"),
            description: t("adminDashboard.linkSessionsDesc", "Active session management"),
        },
        {
            to: "/admin/suspicious-logins",
            label: t("adminDashboard.linkSuspiciousLogins", "Suspicious logins"),
            description: t("adminDashboard.linkSuspiciousLoginsDesc", "Review suspicious login alerts"),
        },
        {
            to: "/admin/breach-check",
            label: t("adminDashboard.linkBreachCheck", "Breach check"),
            description: t("adminDashboard.linkBreachCheckDesc", "Check passwords against known breaches"),
        },
        {
            to: "/admin/email-domains",
            label: t("adminDashboard.linkEmailDomains", "Email domains"),
            description: t("adminDashboard.linkEmailDomainsDesc", "Allowlist and denylist email domains"),
        },
        {
            to: "/admin/report-trends",
            label: t("adminDashboard.linkReportTrends", "Report trends"),
            description: t("adminDashboard.linkReportTrendsDesc", "Content report trends over time"),
        },
        {
            to: "/admin/seo-health",
            label: t("adminDashboard.linkSeoHealth", "SEO health"),
            description: t("adminDashboard.linkSeoHealthDesc", "SEO metrics and issues"),
        },
        {
            to: "/admin/backups",
            label: t("adminDashboard.linkBackups", "Backups"),
            description: t("adminDashboard.linkBackupsDesc", "Backup and restore status"),
        },
        {
            to: "/admin/rate-limits",
            label: t("adminDashboard.linkRateLimits", "Rate limits"),
            description: t("adminDashboard.linkRateLimitsDesc", "Rate-limit metrics per endpoint"),
        },
        {
            to: "/admin/data-exports",
            label: t("adminDashboard.linkDataExports", "Data exports"),
            description: t("adminDashboard.linkDataExportsDesc", "GDPR data export job queue"),
        },
        {
            to: "/admin/account-deletions",
            label: t("adminDashboard.linkAccountDeletions", "Account deletions"),
            description: t("adminDashboard.linkAccountDeletionsDesc", "Account deletion grace-period queue"),
        },
        {
            to: "/admin/oauth-accounts",
            label: t("adminDashboard.linkOauthAccounts", "OAuth accounts"),
            description: t("adminDashboard.linkOauthAccountsDesc", "Connected OAuth accounts"),
        },
    ];

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("admin.title")} — LernChih`}
                    canonicalPath="/admin"
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
                title={`${t("admin.title")} — LernChih`}
                canonicalPath="/admin"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Shield24Regular />
                </span>
                <h1 className={styles.title}>{t("admin.title")}</h1>
            </header>

            {isLoading && <SkeletonList count={3} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("admin.kpisLoadError")}</h2>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {data && (
                <>
                    <ul className={styles.kpiGrid} aria-label={t("admin.kpiSection")}>
                        {kpis.map((kpi) => (
                            <li key={kpi.key}>
                                <Card padding="md" className={styles.kpiCard}>
                                    <div className={styles.kpiHead}>
                                        <span className={styles.kpiIcon} aria-hidden="true">
                                            {kpi.icon}
                                        </span>
                                        {kpi.trend && (
                                            <span
                                                className={`${styles.kpiTrend} ${
                                                    kpi.trend === "up"
                                                        ? styles.kpiTrendUp
                                                        : styles.kpiTrendDown
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
                                    <p className={styles.kpiLabel}>{kpi.label}</p>
                                    <span className={styles.kpiValue}>
                                        {kpi.value.toLocaleString()}
                                    </span>
                                    {kpi.hint && <p className={styles.kpiHint}>{kpi.hint}</p>}
                                </Card>
                            </li>
                        ))}
                    </ul>

                    <div className={styles.chartsGrid}>
                        <Card padding="md" className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>
                                {t("adminDashboard.contentVolumeChart")}
                            </h2>
                            <BarChart
                                data={contentVolume}
                                ariaLabel={t("adminDashboard.contentVolumeChart")}
                            />
                        </Card>
                        <Card padding="md" className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>
                                {t("adminDashboard.engagementChart")}
                            </h2>
                            <HBarChart
                                data={engagement}
                                ariaLabel={t("adminDashboard.engagementChart")}
                            />
                        </Card>
                    </div>

                    <section aria-label={t("adminDashboard.quickLinks")}>
                        <h2 className={styles.sectionTitle}>{t("adminDashboard.quickLinks")}</h2>
                        <ul className={styles.linksGrid}>
                            {adminLinks.map((link) => (
                                <li key={link.to}>
                                    <Card interactive padding="md" className={styles.linkCard}>
                                        <Link to={link.to} className={styles.link}>
                                            <div className={styles.linkBody}>
                                                <span className={styles.linkLabel}>{link.label}</span>
                                                <span className={styles.linkDesc}>
                                                    {link.description}
                                                </span>
                                            </div>
                                            <ArrowRight24Regular className={styles.linkIcon} />
                                        </Link>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </section>
                </>
            )}
        </div>
    );
}
