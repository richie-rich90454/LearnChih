import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock24Regular } from "@fluentui/react-icons";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { PollDisplay, type Poll, type PollMode } from "./PollDisplay";
import { usePollScheduleStore } from "../store/pollScheduleStore";
import styles from "./PollWidget.module.css";

interface PollWidgetProps {
    pollId?: number;
    mode?: PollMode;
    poll?: Poll;
}

const DEMO_POLL: Poll = {
    id: 0,
    question: "Which topic should we cover next?",
    options: [
        { id: 1, text: "Algebra fundamentals", voteCount: 4 },
        { id: 2, text: "Geometry applications", voteCount: 2 },
        { id: 3, text: "Calculus intro", voteCount: 3 },
    ],
    totalVotes: 9,
};

/**
 * Poll widget embedding a configurable PollDisplay (F46) with a scheduled
 * close control (F47). The datetime is persisted in `pollScheduleStore` so
 * reloads honor the schedule.
 *
 * Spec refs: F1.8-F1.12, F46, F47.
 */
export function PollWidget({ pollId, mode = "single", poll }: PollWidgetProps) {
    const { t } = useTranslation();
    const resolved: Poll = poll ?? { ...DEMO_POLL, id: pollId ?? DEMO_POLL.id };
    const closesAt = usePollScheduleStore((s) => s.closesAt[resolved.id] ?? null);
    const scheduleClose = usePollScheduleStore((s) => s.scheduleClose);
    const clearClose = usePollScheduleStore((s) => s.clearClose);
    const [draft, setDraft] = useState<string>(closesAt ?? "");
    const [showScheduler, setShowScheduler] = useState(false);

    return (
        <Card padding="md" className={styles.root}>
            <div className={styles.headerRow}>
                <span className={styles.label}>
                    {t("polls.widgetTitle", "Poll")}
                </span>
                <Button
                    variant="outline"
                    size="small"
                    icon={<CalendarClock24Regular />}
                    onClick={() => setShowScheduler((v) => !v)}
                >
                    {t("pollSchedule.toggle", "Schedule close")}
                </Button>
            </div>
            {showScheduler && (
                <div className={styles.schedulerRow}>
                    <label className={styles.schedulerLabel} htmlFor={`poll-close-${resolved.id}`}>
                        {t("pollSchedule.closesAt", "Closes at")}
                    </label>
                    <input
                        id={`poll-close-${resolved.id}`}
                        type="datetime-local"
                        className={styles.datetimeInput}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className={styles.schedulerActions}>
                        <Button
                            variant="primary"
                            size="small"
                            onClick={() => scheduleClose(resolved.id, draft || null)}
                            disabled={draft === (closesAt ?? "")}
                        >
                            {t("pollSchedule.save", "Save")}
                        </Button>
                        {closesAt && (
                            <Button
                                variant="subtle"
                                size="small"
                                onClick={() => {
                                    clearClose(resolved.id);
                                    setDraft("");
                                }}
                            >
                                {t("pollSchedule.clear", "Clear")}
                            </Button>
                        )}
                    </div>
                </div>
            )}
            <PollDisplay poll={resolved} mode={mode} closesAt={closesAt} />
        </Card>
    );
}

export default PollWidget;
