import { SearchInfo24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import styles from "./SeoHealth.module.css";

type SeoStatus = "good" | "warning" | "bad";

interface SeoMetric {
    key: string;
    label: string;
    value: string;
    status: SeoStatus;
}

const MOCK_METRICS: Omit<SeoMetric, "label">[] = [
    { key: "missingMeta", value: "3", status: "warning" },
    { key: "missingCanonical", value: "1", status: "warning" },
    { key: "brokenLinks", value: "7", status: "bad" },
    { key: "missingAltText", value: "12", status: "bad" },
    { key: "lcpScore", value: "2.4s", status: "good" },
    { key: "clsScore", value: "0.04", status: "good" },
    { key: "indexablePages", value: "248", status: "good" },
    { key: "robotsBlocked", value: "2", status: "warning" },
];

function statusVariant(status: SeoStatus): BadgeVariant {
    if (status === "good") return "success";
    if (status === "warning") return "warning";
    return "danger";
}

export default function SeoHealth() {
    const { t } = useTranslation();

    const metrics: SeoMetric[] = MOCK_METRICS.map((m) => ({
        ...m,
        label: t(`seoHealth.metrics.${m.key}`, m.key),
    }));

    const goodCount = metrics.filter((m) => m.status === "good").length;
    const overall = goodCount >= metrics.length - 2 ? "good" : goodCount >= metrics.length - 4 ? "warning" : "bad";

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                    <SearchInfo24Regular />
                </span>
                <h2 className={styles.title}>
                    {t("seoHealth.title", "SEO health")}
                </h2>
                <Badge variant={statusVariant(overall as SeoStatus)} size="medium">
                    {t(`seoHealth.overall.${overall}`, overall)}
                </Badge>
            </div>

            <ul className={styles.metricList}>
                {metrics.map((metric) => (
                    <li key={metric.key} className={styles.metricRow}>
                        <span className={styles.metricLabel}>{metric.label}</span>
                        <span className={styles.metricValue}>{metric.value}</span>
                        <Badge variant={statusVariant(metric.status)} size="small">
                            {t(`seoHealth.status.${metric.status}`, metric.status)}
                        </Badge>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
