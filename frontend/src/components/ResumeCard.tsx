import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight24Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./ResumeCard.module.css";

export interface LastVisitedEntry {
    path: string;
    title: string;
    timestamp: number;
}

const STORAGE_KEY = "lernchih-last-visited";

/**
 * Records the last-visited detail page in localStorage so the dashboard
 * resume card can offer a one-click return. Swallows storage errors
 * (private mode quota) so reading never breaks.
 */
export function recordLastVisited(path: string, title: string): void {
    try {
        const entry: LastVisitedEntry = { path, title, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch {
        // ignore storage errors (e.g. private mode quota)
    }
}

function readLastVisited(): LastVisitedEntry | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<LastVisitedEntry>;
        if (
            !parsed ||
            typeof parsed.path !== "string" ||
            typeof parsed.title !== "string" ||
            typeof parsed.timestamp !== "number"
        ) {
            return null;
        }
        return {
            path: parsed.path,
            title: parsed.title,
            timestamp: parsed.timestamp,
        };
    } catch {
        return null;
    }
}

/** Localized relative time (e.g. "3 minutes ago") via Intl.RelativeTimeFormat. */
function timeAgo(timestamp: number, language: string): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    if (seconds < 60) return rtf.format(-seconds, "second");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, "minute");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, "hour");
    const days = Math.floor(hours / 24);
    if (days < 30) return rtf.format(-days, "day");
    const months = Math.floor(days / 30);
    if (months < 12) return rtf.format(-months, "month");
    return rtf.format(-Math.floor(months / 12), "year");
}

/**
 * Dashboard "Continue where you left off" card. Reads the last-visited
 * detail page from localStorage on mount and renders a Card with the title,
 * a relative time, and a Button to navigate back. Renders nothing when no
 * entry exists.
 *
 * Spec ref: F74.
 */
export function ResumeCard() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [entry, setEntry] = useState<LastVisitedEntry | null>(null);

    useEffect(() => {
        setEntry(readLastVisited());
    }, []);

    if (!entry) return null;

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.body}>
                <p className={styles.label}>{t("dashboard.continueWhereYouLeftOff")}</p>
                <p className={styles.title}>{entry.title}</p>
                <p className={styles.time}>{timeAgo(entry.timestamp, i18n.language)}</p>
            </div>
            <Button
                variant="primary"
                icon={<ArrowRight24Regular />}
                onClick={() => navigate(entry.path)}
            >
                {t("dashboard.continue")}
            </Button>
        </Card>
    );
}

export default ResumeCard;
