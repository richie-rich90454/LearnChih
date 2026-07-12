import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ReputationGraph.module.css";

export interface ReputationPoint {
    date: string;
    value: number;
}

interface ReputationGraphProps {
    data: ReputationPoint[];
    /** Label for the y-axis (e.g., "Reputation"). */
    label?: string;
    height?: number;
}

const GRAPH_PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

/**
 * Inline SVG line graph showing reputation history over time (F60). Renders a
 * smooth line path with a gradient fill below it. Axes show min/max values and
 * date labels. Honors `prefers-reduced-motion` by disabling the draw animation.
 *
 * Spec ref: F60.
 */
export function ReputationGraph({
    data,
    label,
    height = 200,
}: ReputationGraphProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();

    const { points, areaPath, linePath, minY, maxY, xLabels, width } = useMemo(() => {
        const w = 600;
        const h = height;
        const pad = GRAPH_PADDING;
        const innerW = w - pad.left - pad.right;
        const innerH = h - pad.top - pad.bottom;

        if (data.length === 0) {
            return {
                points: [] as { x: number; y: number; value: number; date: string }[],
                areaPath: "",
                linePath: "",
                minY: 0,
                maxY: 0,
                xLabels: [] as { x: number; label: string }[],
                width: w,
            };
        }

        const values = data.map((d) => d.value);
        const min = Math.min(...values, 0);
        const max = Math.max(...values, 1);
        const range = max - min || 1;

        const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

        const pts = data.map((d, i) => {
            const x = pad.left + i * stepX;
            const y = pad.top + innerH - ((d.value - min) / range) * innerH;
            return { x, y, value: d.value, date: d.date };
        });

        const line = pts
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(" ");

        const area =
            `M ${pts[0].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} ` +
            pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
            ` L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;

        const labels = data.map((d, i) => ({
            x: pts[i].x,
            label: new Date(d.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
            }),
        }));

        // Show at most 7 labels to avoid crowding.
        const maxLabels = 7;
        const labelStep = Math.ceil(labels.length / maxLabels);
        const filteredLabels = labels.filter((_, i) => i % labelStep === 0);

        return {
            points: pts,
            areaPath: area,
            linePath: line,
            minY: min,
            maxY: max,
            xLabels: filteredLabels,
            width: w,
        };
    }, [data, height]);

    if (data.length === 0) {
        return (
            <div className={styles.empty}>
                {t("reputationGraph.noData", "No reputation data available.")}
            </div>
        );
    }

    const pad = GRAPH_PADDING;
    const innerH = height - pad.top - pad.bottom;

    return (
        <div className={styles.container}>
            {label && <div className={styles.label}>{label}</div>}
            <svg
                className={styles.svg}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={t("reputationGraph.title", "Reputation history")}
            >
                <defs>
                    <linearGradient id="reputationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = pad.top + innerH * (1 - ratio);
                    const value = Math.round(minY + (maxY - minY) * ratio);
                    return (
                        <g key={ratio}>
                            <line
                                x1={pad.left}
                                y1={y}
                                x2={width - pad.right}
                                y2={y}
                                className={styles.gridLine}
                            />
                            <text
                                x={pad.left - 8}
                                y={y + 4}
                                textAnchor="end"
                                className={styles.axisText}
                            >
                                {value}
                            </text>
                        </g>
                    );
                })}

                {/* Area fill */}
                <path d={areaPath} fill="url(#reputationGradient)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={reduced ? styles.lineStatic : styles.lineAnimated}
                />

                {/* Data point dots */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={3}
                        className={styles.dot}
                    >
                        <title>
                            {`${new Date(p.date).toLocaleDateString()}: ${p.value}`}
                        </title>
                    </circle>
                ))}

                {/* X-axis labels */}
                {xLabels.map((lbl, i) => (
                    <text
                        key={i}
                        x={lbl.x}
                        y={height - pad.bottom + 20}
                        textAnchor="middle"
                        className={styles.axisText}
                    >
                        {lbl.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}

/**
 * Generates mock reputation history data for a user based on their current
 * credits. Produces 7 data points spanning the last 7 days.
 */
export function generateMockReputationData(currentCredits: number): ReputationPoint[] {
    const points: ReputationPoint[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Start from ~70% of current credits and grow to current.
    const start = Math.max(0, Math.floor(currentCredits * 0.7));
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * dayMs).toISOString();
        const progress = (6 - i) / 6;
        const value = Math.round(start + (currentCredits - start) * progress);
        points.push({ date, value });
    }
    return points;
}

export default ReputationGraph;
