import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Play24Regular, Pause24Regular, ArrowSyncCircle24Regular } from "@fluentui/react-icons";
import { useCowatchStore, type CoWatchResource } from "../store/cowatchStore";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import styles from "./CoWatch.module.css";

interface CoWatchProps {
    groupId: number;
}

const DEMO_RESOURCE: CoWatchResource = {
    id: "demo-lecture",
    title: "Intro to Linear Algebra — Lecture 1",
    url: "https://www.youtube.com/embed/fNk_zzaMoSs",
};

const TICK_MS = 1000;

/**
 * Co-watch widget for study groups (F45). Renders a mock video surface plus a
 * sync indicator and play/pause control. State (resource, playhead, playing)
 * persists in `cowatchStore` so reloading the page resumes the session.
 *
 * The playhead advances locally every second while playing; in a real
 * implementation this would be driven by a real-time channel. No real video
 * playback occurs — the iframe is a placeholder.
 *
 * Spec ref: F45.
 */
export function CoWatch({ groupId }: CoWatchProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const session = useCowatchStore((s) => s.sessions[groupId]);
    const setResource = useCowatchStore((s) => s.setResource);
    const setPlayhead = useCowatchStore((s) => s.setPlayhead);
    const setPlaying = useCowatchStore((s) => s.setPlaying);

    const resource = session?.resource ?? null;
    const playhead = session?.playhead ?? 0;
    const isPlaying = session?.isPlaying ?? false;

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!isPlaying) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }
        intervalRef.current = setInterval(() => {
            setPlayhead(groupId, playhead + 1);
        }, TICK_MS);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, playhead, groupId, setPlayhead]);

    const handleTogglePlay = () => {
        if (!resource) {
            setResource(groupId, DEMO_RESOURCE);
            setPlaying(groupId, true);
            return;
        }
        setPlaying(groupId, !isPlaying);
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return (
        <Card padding="md" className={styles.root}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h3 className={styles.title}>
                        {t("coWatch.title", "Co-watch")}
                    </h3>
                    <p className={styles.subtitle}>
                        {resource
                            ? resource.title
                            : t("coWatch.noResource", "No resource loaded")}
                    </p>
                </div>
                <Badge
                    variant={isPlaying ? "success" : "neutral"}
                    icon={<ArrowSyncCircle24Regular className={reduced ? styles.noSpin : styles.spin} />}
                >
                    {isPlaying
                        ? t("coWatch.synced", "Synced")
                        : t("coWatch.paused", "Paused")}
                </Badge>
            </div>

            <div className={styles.surface}>
                {resource ? (
                    <iframe
                        className={styles.iframe}
                        src={resource.url}
                        title={resource.title}
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                ) : (
                    <div className={styles.placeholder} aria-hidden="true" />
                )}
                <div className={styles.badge} aria-hidden="true">
                    {t("coWatch.previewLabel", "Preview")}
                </div>
            </div>

            <div className={styles.controls}>
                <Button
                    variant={isPlaying ? "outline" : "primary"}
                    size="small"
                    icon={isPlaying ? <Pause24Regular /> : <Play24Regular />}
                    onClick={handleTogglePlay}
                    className={reduced ? styles.noAnim : undefined}
                >
                    {isPlaying
                        ? t("coWatch.pause", "Pause")
                        : t("coWatch.play", "Play")}
                </Button>
                <span className={styles.playhead} aria-label={t("coWatch.position", "Playhead position")}>
                    {formatTime(playhead)}
                </span>
            </div>
        </Card>
    );
}

export default CoWatch;
