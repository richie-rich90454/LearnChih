import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Spinner } from "@fluentui/react-components";
import {
    ShareScreenStart24Regular,
    ShareScreenStop24Regular,
    ProjectionScreen24Regular,
} from "@fluentui/react-icons";
import {
    getScreenShares,
    startScreenShare,
    endScreenShare,
    type ScreenShareSession,
} from "../api/screenShares";
import useAuthStore from "../store/authStore";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import styles from "./ScreenShare.module.css";

interface ScreenSharesProps {
    groupId: number;
}

const invalidateGroup = (qc: ReturnType<typeof useQueryClient>, groupId: number) => {
    qc.invalidateQueries({ queryKey: ["screenShares", groupId] });
};

export function ScreenShares({ groupId }: ScreenSharesProps) {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const userId = useAuthStore((s) => s.user?.userId);

    const { data: sessions, isLoading, isError, refetch } = useQuery<ScreenShareSession[]>({
        queryKey: ["screenShares", groupId],
        queryFn: () => getScreenShares(groupId).then((r) => r.data),
    });

    const startMutation = useMutation({
        mutationFn: () => startScreenShare(groupId),
        onSuccess: () => invalidateGroup(qc, groupId),
    });
    const endMutation = useMutation({
        mutationFn: (id: number) => endScreenShare(groupId, id),
        onSuccess: () => invalidateGroup(qc, groupId),
    });

    const [sharingId, setSharingId] = useState<number | null>(null);

    const list = sessions ?? [];

    const handleStart = async () => {
        try {
            const res = await startMutation.mutateAsync();
            setSharingId(res.data.id);
        } catch {
            /* error handled by mutation state */
        }
    };

    const handleEnd = (session: ScreenShareSession) => {
        if (window.confirm(t("screenShares.endConfirm"))) {
            endMutation.mutate(session.id);
            if (sharingId === session.id) setSharingId(null);
        }
    };

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>{t("screenShares.title")}</h2>
                    <p className={styles.panelSubtitle}>{t("screenShares.subtitle")}</p>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<ShareScreenStart24Regular />}
                    onClick={handleStart}
                    loading={startMutation.isPending}
                >
                    {t("screenShares.startSharing")}
                </Button>
            </header>

            {isLoading && <Spinner label={t("common.loading")} />}
            {isError && (
                <ErrorState
                    icon={<ProjectionScreen24Regular />}
                    title={t("screenShares.errorTitle")}
                    description={t("screenShares.errorDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!isLoading && !isError && list.length === 0 && (
                <EmptyState
                    icon={<ProjectionScreen24Regular />}
                    title={t("screenShares.noSessions")}
                    description={t("screenShares.subtitle")}
                />
            )}

            <div className={styles.sessionList}>
                {list.map((session) => (
                    <ScreenShareCard
                        key={session.id}
                        session={session}
                        isSharing={sharingId === session.id}
                        onEnd={() => handleEnd(session)}
                        canEnd={session.sharerUserId === userId}
                        t={t}
                    />
                ))}
            </div>

            {sharingId !== null && (
                <LocalScreenPreview
                    t={t}
                    onStop={() => {
                        if (sharingId !== null) {
                            endMutation.mutate(sharingId);
                            setSharingId(null);
                        }
                    }}
                />
            )}
        </div>
    );
}

interface ScreenShareCardProps {
    session: ScreenShareSession;
    isSharing: boolean;
    onEnd: () => void;
    canEnd: boolean;
    t: ReturnType<typeof useTranslation>["t"];
}

function ScreenShareCard({ session, isSharing, onEnd, canEnd, t }: ScreenShareCardProps) {
    return (
        <Card padding="md" className={styles.sessionCard}>
            <div className={styles.sessionTop}>
                <h3 className={styles.sessionSharer}>{session.sharerName}</h3>
                <Badge variant={session.active ? "success" : "neutral"} size="small">
                    {session.active ? t("screenShares.live") : t("screenShares.ended")}
                </Badge>
            </div>
            <div className={styles.sessionMeta}>
                <span>{t("common.byAuthor", { author: session.sharerName })}</span>
            </div>
            <div className={styles.sessionActions}>
                {isSharing && (
                    <Button
                        variant="primary"
                        size="small"
                        icon={<ShareScreenStop24Regular />}
                        onClick={onEnd}
                    >
                        {t("screenShares.stopSharing")}
                    </Button>
                )}
                {canEnd && session.active && !isSharing && (
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<ShareScreenStop24Regular />}
                        onClick={onEnd}
                    >
                        {t("screenShares.endSession")}
                    </Button>
                )}
            </div>
        </Card>
    );
}

/**
 * Local screen preview: requests screen capture via getDisplayMedia and
 * renders the live video stream in a <video> element. Cleans up tracks on
 * unmount or when the user stops sharing.
 */
function LocalScreenPreview({
    t,
    onStop,
}: {
    t: ReturnType<typeof useTranslation>["t"];
    onStop: () => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stop = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((tr) => tr.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const start = useCallback(async () => {
        setError(null);
        try {
            if (!navigator.mediaDevices?.getDisplayMedia) {
                throw new DOMException("getDisplayMedia not supported", "NotSupportedError");
            }
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            // Auto-stop when the user ends the share via browser UI
            stream.getVideoTracks().forEach((track) => {
                track.addEventListener("ended", () => {
                    stop();
                    onStop();
                });
            });
        } catch (e) {
            const err = e as DOMException;
            if (err.name === "NotAllowedError" || err.name === "SecurityError") {
                setError(t("screenShares.permissionDenied"));
            } else {
                setError(t("screenShares.screenError"));
            }
            stop();
            onStop();
        }
    }, [stop, onStop, t]);

    useEffect(() => {
        void start();
        return () => stop();
    }, [start, stop]);

    return (
        <div className={styles.preview}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.video}
                aria-label={t("screenShares.previewLabel")}
            />
            {error && (
                <p className={styles.previewError} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
