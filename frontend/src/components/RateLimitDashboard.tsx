import { Gauge24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./RateLimitDashboard.module.css";

interface EndpointMetric {
    endpoint: string;
    rpm: number;
    blocked: number;
}

const MOCK_ENDPOINTS: EndpointMetric[] = [
    { endpoint: "GET /api/resources", rpm: 420, blocked: 3 },
    { endpoint: "POST /api/auth/login", rpm: 180, blocked: 12 },
    { endpoint: "GET /api/channels", rpm: 260, blocked: 1 },
    { endpoint: "POST /api/flashcards", rpm: 95, blocked: 0 },
    { endpoint: "GET /api/leaderboard", rpm: 310, blocked: 5 },
];

const MOCK_BLOCKED_IPS: Array<{ ip: string; count: number }> = [
    { ip: "203.0.113.9", count: 42 },
    { ip: "198.51.100.7", count: 28 },
    { ip: "192.0.2.55", count: 15 },
];

function EndpointBarChart({ data, ariaLabel }: { data: EndpointMetric[]; ariaLabel: string }) {
    const width = 560;
    const height = 200;
    const padLeft = 140;
    const padRight = 48;
    const padTop = 8;
    const padBottom = 8;
    const plotW = width - padLeft - padRight;
    const rowH = (height - padTop - padBottom) / Math.max(1, data.length);
    const barH = Math.min(18, rowH * 0.6);
    const max = Math.max(1, ...data.map((d) => d.rpm));

    return (
        <svg
            className={styles.chart}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={ariaLabel}
            preserveAspectRatio="xMidYMid meet"
        >
            {data.map((d, i) => {
                const y = padTop + i * rowH + (rowH - barH) / 2;
                const w = (plotW * d.rpm) / max;
                return (
                    <g key={d.endpoint}>
                        <text x={padLeft - 10} y={y + barH / 2 + 4} textAnchor="end" className={styles.axisLabel}>
                            {d.endpoint}
                        </text>
                        <rect
                            x={padLeft}
                            y={y}
                            width={Math.max(2, w)}
                            height={barH}
                            rx={4}
                            className={styles.bar}
                        />
                        <text x={padLeft + w + 8} y={y + barH / 2 + 4} className={styles.barValue}>
                            {d.rpm}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function RateLimitDashboard() {
    const { t } = useTranslation();
    const totalRpm = MOCK_ENDPOINTS.reduce((s, e) => s + e.rpm, 0);
    const totalBlocked = MOCK_ENDPOINTS.reduce((s, e) => s + e.blocked, 0);

    return (
        <div className={styles.page}>
            <Card padding="md" className={styles.summary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                        {t("rateLimitDashboard.totalRpm", "Total req/min")}
                    </span>
                    <span className={styles.summaryValue}>{totalRpm}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                        {t("rateLimitDashboard.totalBlocked", "Blocked (1h)")}
                    </span>
                    <span className={styles.summaryValue}>{totalBlocked}</span>
                </div>
            </Card>

            <Card padding="md" className={styles.section}>
                <div className={styles.sectionHead}>
                    <span className={styles.icon} aria-hidden="true">
                        <Gauge24Regular />
                    </span>
                    <h2 className={styles.sectionTitle}>
                        {t("rateLimitDashboard.byEndpoint", "Requests per minute by endpoint")}
                    </h2>
                </div>
                <EndpointBarChart
                    data={MOCK_ENDPOINTS}
                    ariaLabel={t("rateLimitDashboard.byEndpoint", "Requests per minute by endpoint")}
                />
            </Card>

            <Card padding="md" className={styles.section}>
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>
                        {t("rateLimitDashboard.topBlockedIps", "Top blocked IPs")}
                    </h2>
                </div>
                <ul className={styles.ipList}>
                    {MOCK_BLOCKED_IPS.map((entry) => (
                        <li key={entry.ip} className={styles.ipRow}>
                            <code className={styles.ipCode}>{entry.ip}</code>
                            <span className={styles.ipCount}>
                                {t("rateLimitDashboard.blocks", { count: entry.count, defaultValue: "{{count}} blocks" })}
                            </span>
                            <Badge variant={entry.count > 30 ? "danger" : "warning"} size="small">
                                {entry.count > 30
                                    ? t("rateLimitDashboard.severityHigh", "High")
                                    : t("rateLimitDashboard.severityMedium", "Medium")}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
