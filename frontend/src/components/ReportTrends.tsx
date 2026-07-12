import { useMemo, useState } from "react";
import { Flag24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ReportTrends.module.css";

type Reason = "spam" | "harassment" | "off-topic" | "other";

const REASONS: Reason[] = ["spam", "harassment", "off-topic", "other"];

interface DayBucket {
    day: number;
    counts: Record<Reason, number>;
}

/** Deterministic mock data: 30 days of report counts per reason. */
function buildMockData(): DayBucket[] {
    const buckets: DayBucket[] = [];
    let seed = 42;
    const rand = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };
    for (let day = 0; day < 30; day++) {
        buckets.push({
            day,
            counts: {
                spam: Math.floor(rand() * 8) + 1,
                harassment: Math.floor(rand() * 5) + 1,
                "off-topic": Math.floor(rand() * 4),
                other: Math.floor(rand() * 3),
            },
        });
    }
    return buckets;
}

function LineChart({ data, ariaLabel }: { data: DayBucket[]; ariaLabel: string }) {
    const width = 640;
    const height = 240;
    const padLeft = 40;
    const padBottom = 32;
    const padTop = 16;
    const padRight = 16;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const max = Math.max(
        1,
        ...data.map((d) => d.counts.spam + d.counts.harassment + d.counts["off-topic"] + d.counts.other),
    );

    const slot = plotW / Math.max(1, data.length - 1);

    const linePath = (reason: Reason): string => {
        return data
            .map((d, i) => {
                const x = padLeft + i * slot;
                const y = padTop + plotH - (d.counts[reason] / max) * plotH;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
    };

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
                            {Math.round(g * max)}
                        </text>
                    </g>
                );
            })}
            <path d={linePath("spam")} className={`${styles.line} ${styles.lineSpam}`} />
            <path d={linePath("harassment")} className={`${styles.line} ${styles.lineHarassment}`} />
            <path d={linePath("off-topic")} className={`${styles.line} ${styles.lineOffTopic}`} />
            <path d={linePath("other")} className={`${styles.line} ${styles.lineOther}`} />
        </svg>
    );
}

export default function ReportTrends() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const data = useMemo(buildMockData, []);
    const [activeReasons, setActiveReasons] = useState<Set<Reason>>(new Set(REASONS));

    const toggleReason = (reason: Reason) => {
        setActiveReasons((prev) => {
            const next = new Set(prev);
            if (next.has(reason)) next.delete(reason);
            else next.add(reason);
            return next;
        });
    };

    const filteredData = useMemo(
        () =>
            data.map((bucket) => ({
                day: bucket.day,
                counts: {
                    spam: activeReasons.has("spam") ? bucket.counts.spam : 0,
                    harassment: activeReasons.has("harassment") ? bucket.counts.harassment : 0,
                    "off-topic": activeReasons.has("off-topic") ? bucket.counts["off-topic"] : 0,
                    other: activeReasons.has("other") ? bucket.counts.other : 0,
                } as Record<Reason, number>,
            })),
        [data, activeReasons],
    );

    const total = filteredData.reduce(
        (sum, d) =>
            sum + d.counts.spam + d.counts.harassment + d.counts["off-topic"] + d.counts.other,
        0,
    );

    const reasonColor: Record<Reason, string> = {
        spam: styles.swatchSpam,
        harassment: styles.swatchHarassment,
        "off-topic": styles.swatchOffTopic,
        other: styles.swatchOther,
    };

    return (
        <Card padding="md" className={styles.panel}>
            <div className={styles.head}>
                <span className={styles.icon} aria-hidden="true">
                    <Flag24Regular />
                </span>
                <h2 className={styles.title}>
                    {t("reportTrends.title", "Content report trends")}
                </h2>
                <span className={styles.total}>
                    {t("reportTrends.total", { count: total, defaultValue: "{{count}} reports (30d)" })}
                </span>
            </div>

            <div className={styles.chips}>
                {REASONS.map((reason) => (
                    <button
                        key={reason}
                        type="button"
                        className={`${styles.chip} ${activeReasons.has(reason) ? styles.chipActive : ""} ${reasonColor[reason]}`}
                        onClick={() => toggleReason(reason)}
                        aria-pressed={activeReasons.has(reason)}
                    >
                        <span className={styles.swatch} aria-hidden="true" />
                        {t(`reportTrends.reasons.${reason}`, reason)}
                    </button>
                ))}
            </div>

            <LineChart
                data={filteredData}
                ariaLabel={t("reportTrends.title", "Content report trends")}
            />

            <p className={styles.footnote} style={reduced ? { transitionDuration: "0ms" } : undefined}>
                {t("reportTrends.window", "Last 30 days")}
            </p>
        </Card>
    );
}
