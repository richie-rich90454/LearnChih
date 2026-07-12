import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    Spinner,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import {
    Mic24Regular,
    MicOff24Regular,
    Call24Regular,
    CallEnd24Regular,
    Add24Regular,
} from "@fluentui/react-icons";
import {
    getVoiceRooms,
    createVoiceRoom,
    endVoiceRoom,
    type VoiceRoom,
} from "../api/voiceRooms";
import useAuthStore from "../store/authStore";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import styles from "./VoiceRoom.module.css";

interface VoiceRoomsProps {
    groupId: number;
}

const invalidateGroup = (qc: ReturnType<typeof useQueryClient>, groupId: number) => {
    qc.invalidateQueries({ queryKey: ["voiceRooms", groupId] });
};

export function VoiceRooms({ groupId }: VoiceRoomsProps) {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const userId = useAuthStore((s) => s.user?.userId);

    const { data: rooms, isLoading, isError, refetch } = useQuery<VoiceRoom[]>({
        queryKey: ["voiceRooms", groupId],
        queryFn: () => getVoiceRooms(groupId).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createVoiceRoom(groupId, { name }),
        onSuccess: () => invalidateGroup(qc, groupId),
    });
    const endMutation = useMutation({
        mutationFn: (id: number) => endVoiceRoom(groupId, id),
        onSuccess: () => invalidateGroup(qc, groupId),
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [joinedRoomId, setJoinedRoomId] = useState<number | null>(null);

    const list = rooms ?? [];

    const handleEnd = (room: VoiceRoom) => {
        if (window.confirm(t("voiceRooms.endConfirm"))) {
            endMutation.mutate(room.id);
            if (joinedRoomId === room.id) setJoinedRoomId(null);
        }
    };

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>{t("voiceRooms.title")}</h2>
                    <p className={styles.panelSubtitle}>{t("voiceRooms.subtitle")}</p>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => setCreateOpen(true)}
                >
                    {t("voiceRooms.createButton")}
                </Button>
            </header>

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}
            {isError && (
                <ErrorState
                    icon={<Call24Regular />}
                    title={t("voiceRooms.errorTitle")}
                    description={t("voiceRooms.errorDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!isLoading && !isError && list.length === 0 && (
                <EmptyState
                    icon={<Call24Regular />}
                    title={t("voiceRooms.noRooms")}
                    description={t("voiceRooms.subtitle")}
                />
            )}

            <div className={styles.roomList}>
                {list.map((room) => (
                    <VoiceRoomCard
                        key={room.id}
                        room={room}
                        joined={joinedRoomId === room.id}
                        onJoin={() => setJoinedRoomId(room.id)}
                        onLeave={() => setJoinedRoomId(null)}
                        onEnd={() => handleEnd(room)}
                        canEnd={room.createdBy === userId}
                        t={t}
                    />
                ))}
            </div>

            <CreateRoomDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={(name) => {
                    createMutation.mutate(name, {
                        onSuccess: () => setCreateOpen(false),
                    });
                }}
                loading={createMutation.isPending}
                error={createMutation.isError ? t("voiceRooms.createError") : undefined}
                t={t}
            />
        </div>
    );
}

interface VoiceRoomCardProps {
    room: VoiceRoom;
    joined: boolean;
    onJoin: () => void;
    onLeave: () => void;
    onEnd: () => void;
    canEnd: boolean;
    t: ReturnType<typeof useTranslation>["t"];
}

function VoiceRoomCard({ room, joined, onJoin, onLeave, onEnd, canEnd, t }: VoiceRoomCardProps) {
    return (
        <Card padding="md" className={styles.roomCard}>
            <div className={styles.roomTop}>
                <h3 className={styles.roomName}>{room.name}</h3>
                <Badge variant={room.active ? "success" : "neutral"} size="small">
                    {room.active ? t("voiceRooms.live") : t("voiceRooms.ended")}
                </Badge>
            </div>
            <div className={styles.roomMeta}>
                <span>{t("common.byAuthor", { author: room.creatorName })}</span>
            </div>

            {joined && room.active && <LocalAudioPreview t={t} />}

            <div className={styles.roomActions}>
                {!joined && room.active && (
                    <Button
                        variant="primary"
                        size="small"
                        icon={<Call24Regular />}
                        onClick={onJoin}
                    >
                        {t("voiceRooms.join")}
                    </Button>
                )}
                {joined && (
                    <Button
                        variant="outline"
                        size="small"
                        icon={<CallEnd24Regular />}
                        onClick={onLeave}
                    >
                        {t("voiceRooms.leave")}
                    </Button>
                )}
                {canEnd && room.active && (
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<CallEnd24Regular />}
                        onClick={onEnd}
                    >
                        {t("voiceRooms.endRoom")}
                    </Button>
                )}
            </div>

            {joined && <ParticipantList t={t} />}
        </Card>
    );
}

/**
 * Local audio preview: requests microphone access via getUserMedia and
 * renders a live audio-level meter driven by a Web Audio analyser.
 */
function LocalAudioPreview({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
    const [muted, setMuted] = useState(false);
    const [level, setLevel] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number | null>(null);

    const stop = useCallback(() => {
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((tr) => tr.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            void audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        analyserRef.current = null;
        setLevel(0);
    }, []);

    const start = useCallback(async () => {
        setError(null);
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new DOMException("getUserMedia not supported", "NotSupportedError");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const gain = ctx.createGain();
            gain.gain.value = 0;
            source.connect(analyser);
            analyser.connect(gain);
            gain.connect(ctx.destination);
            analyserRef.current = analyser;

            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteTimeDomainData(data);
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                setLevel(Math.min(1, rms * 3));
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        } catch (e) {
            const err = e as DOMException;
            if (err.name === "NotAllowedError" || err.name === "SecurityError") {
                setError(t("voiceRooms.micDenied"));
            } else {
                setError(t("voiceRooms.micError"));
            }
            stop();
        }
    }, [stop, t]);

    useEffect(() => {
        void start();
        return () => stop();
    }, [start, stop]);

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((tr) => {
                tr.enabled = !next;
            });
        }
    };

    const pct = Math.round(level * 100);

    return (
        <div className={styles.preview}>
            <div className={styles.previewRow}>
                <Button
                    variant={muted ? "primary" : "outline"}
                    size="small"
                    icon={muted ? <MicOff24Regular /> : <Mic24Regular />}
                    onClick={toggleMute}
                >
                    {muted ? t("voiceRooms.unmute") : t("voiceRooms.mute")}
                </Button>
                <div
                    className={styles.meter}
                    role="meter"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("voiceRooms.levelLabel")}
                >
                    <div className={styles.meterFill} style={{ width: `${pct}%` }} />
                </div>
            </div>
            {error && (
                <p className={styles.previewError} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function ParticipantList({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
    return (
        <div className={styles.participants}>
            <span className={styles.participantsLabel}>{t("voiceRooms.participants")}</span>
            <ul className={styles.participantList}>
                <li className={styles.participantItem}>
                    <span className={styles.participantDot} aria-hidden="true" />
                    {t("voiceRooms.you")}
                </li>
            </ul>
        </div>
    );
}

interface CreateRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
    loading: boolean;
    error?: string;
    t: ReturnType<typeof useTranslation>["t"];
}

function CreateRoomDialog({ open, onClose, onCreate, loading, error, t }: CreateRoomDialogProps) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) setName("");
    }, [open]);

    const handleSubmit = () => {
        onCreate(name.trim());
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open) onClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("voiceRooms.createTitle")}</DialogTitle>
                    <DialogContent>
                        <div className={styles.form}>
                            <Input
                                label={t("voiceRooms.fieldName")}
                                placeholder={t("voiceRooms.fieldNamePlaceholder")}
                                value={name}
                                onChange={(_, d) => setName(d.value)}
                            />
                            {error && (
                                <p className={styles.formError} role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={onClose}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            loading={loading}
                            disabled={!name.trim()}
                            onClick={handleSubmit}
                        >
                            {t("voiceRooms.createConfirm")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
