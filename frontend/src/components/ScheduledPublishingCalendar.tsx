import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Dismiss24Regular,
} from "@fluentui/react-icons";
import { useScheduledPublishingStore } from "@/store/scheduledPublishingStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./ScheduledPublishingCalendar.module.css";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Returns YYYY-MM-DD for a date in local time (drops time + timezone). */
function toDayKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return toDayKey(a) === toDayKey(b);
}

/**
 * Month-grid calendar of scheduled publishing items. Renders the current
 * month (navigable back/forward) using an HTML <table> + <time> elements;
 * each date cell shows a count badge for items scheduled that day. Clicking
 * a date opens a side panel listing those items with a cancel action.
 *
 * Spec ref: F65.
 */
export function ScheduledPublishingCalendar() {
    const { t } = useTranslation();
    const scheduled = useScheduledPublishingStore((s) => s.scheduled);
    const cancel = useScheduledPublishingStore((s) => s.cancel);

    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState<string>(toDayKey(today));

    const goPrev = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const goNext = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    // Build a 6x7 grid of dates covering the month (Sun-first).
    const grid: Date[] = useMemo(() => {
        const first = new Date(viewYear, viewMonth, 1);
        const startOffset = first.getDay();
        const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);
        const cells: Date[] = [];
        for (let i = 0; i < 42; i++) {
            cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
        }
        return cells;
    }, [viewYear, viewMonth]);

    const byDay = useMemo(() => {
        const map = new Map<string, typeof scheduled>();
        for (const item of scheduled) {
            const key = toDayKey(new Date(item.scheduledFor));
            const arr = map.get(key) ?? [];
            arr.push(item);
            map.set(key, arr);
        }
        return map;
    }, [scheduled]);

    const monthItems = useMemo(
        () =>
            scheduled.filter((s) => {
                const d = new Date(s.scheduledFor);
                return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
            }),
        [scheduled, viewYear, viewMonth],
    );

    const selectedItems = byDay.get(selectedKey) ?? [];
    const selectedDate = new Date(`${selectedKey}T00:00:00`);
    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
        undefined,
        { year: "numeric", month: "long" },
    );

    return (
        <div className={styles.calendar}>
            <div>
                <div className={styles.monthHeader}>
                    <Button
                        variant="outline"
                        size="small"
                        icon={<ChevronLeft24Regular />}
                        onClick={goPrev}
                        aria-label={t("scheduledPublishing.previousMonth", "Previous month")}
                    />
                    <h3 className={styles.monthLabel}>{monthLabel}</h3>
                    <Button
                        variant="outline"
                        size="small"
                        icon={<ChevronRight24Regular />}
                        onClick={goNext}
                        aria-label={t("scheduledPublishing.nextMonth", "Next month")}
                    />
                </div>

                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            {WEEKDAY_KEYS.map((k) => (
                                <th key={k} scope="col">
                                    {t(`scheduledPublishing.weekdayShort.${k}`, k.toUpperCase())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, weekIdx) => (
                            <tr key={weekIdx}>
                                {Array.from({ length: 7 }).map((__, dayIdx) => {
                                    const idx = weekIdx * 7 + dayIdx;
                                    const date = grid[idx];
                                    const key = toDayKey(date);
                                    const outOfMonth =
                                        date.getMonth() !== viewMonth;
                                    const items = byDay.get(key) ?? [];
                                    const isSelected = selectedKey === key;
                                    const isToday = isSameDay(date, today);
                                    const cellClass = [
                                        styles.tcell,
                                        outOfMonth && styles.tcellOut,
                                        isSelected && styles.tcellSelected,
                                    ]
                                        .filter(Boolean)
                                        .join(" ");
                                    return (
                                        <td key={key} className={cellClass}>
                                            <button
                                                type="button"
                                                className={styles.dayButton}
                                                onClick={() => setSelectedKey(key)}
                                                aria-pressed={isSelected}
                                            >
                                                {isToday ? (
                                                    <span
                                                        className={styles.todayDot}
                                                        aria-label={t("scheduledPublishing.today", "Today")}
                                                    >
                                                        {date.getDate()}
                                                    </span>
                                                ) : (
                                                    <span>{date.getDate()}</span>
                                                )}
                                                {items.length > 0 && (
                                                    <span className={styles.countBadge}>
                                                        {items.length}
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {monthItems.length === 0 && (
                    <p className={styles.sidePanelEmpty}>
                        {t("scheduledPublishing.noItemsMonth", "No scheduled items this month.")}
                    </p>
                )}
            </div>

            <aside className={styles.sidePanel} aria-label={t("scheduledPublishing.subtitle", "See when your drafts are scheduled to go live.")}>
                <h4 className={styles.sidePanelTitle}>
                    {t("scheduledPublishing.itemsFor", "Items for {{date}}", {
                        date: selectedDate.toLocaleDateString(),
                    })}
                </h4>
                {selectedItems.length === 0 ? (
                    <p className={styles.sidePanelEmpty}>
                        {t("scheduledPublishing.noItems", "No items scheduled for this day.")}
                    </p>
                ) : (
                    <ul className={styles.itemList}>
                        {selectedItems.map((item) => (
                            <li key={item.id} className={styles.itemRow}>
                                <span className={styles.itemTitle}>{item.title}</span>
                                <Badge variant="neutral" size="small">
                                    {t(`scheduledPublishing.type.${item.type}`, item.type)}
                                </Badge>
                                <time
                                    className={styles.itemTime}
                                    dateTime={item.scheduledFor}
                                >
                                    {new Date(item.scheduledFor).toLocaleString()}
                                </time>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<Dismiss24Regular />}
                                    onClick={() => cancel(item.id)}
                                    className={styles.cancelButton}
                                >
                                    {t("scheduledPublishing.cancel", "Cancel")}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </div>
    );
}

export default ScheduledPublishingCalendar;
