import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Textarea } from "@fluentui/react-components";
import {
    PeopleTeam24Regular,
    ArrowExit24Regular,
    Save24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { getNote, updateNote, type Note } from "@/api/notes";
import {
    getNoteCollaborators,
    type NoteCollaborator,
} from "@/api/noteCollaborators";
import useAuthStore from "@/store/authStore";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import styles from "./CollaborativeNoteEditor.module.css";

interface CollaborativeNoteEditorProps {
    /** The note to edit collaboratively. */
    noteId: number;
    /** Called when the user exits collaborative mode. */
    onExit: () => void;
}

/** Milliseconds between background polls for remote updates. */
const POLL_INTERVAL = 3000;
/** Milliseconds of inactivity before a debounced save fires. */
const SAVE_DEBOUNCE = 1500;
/** Don't apply remote updates if the user typed within this window. */
const EDIT_GRACE = 3000;

/**
 * Real-time collaborative note editor (F14). Polls the note and its
 * collaborator list every 3 seconds, auto-saves local edits after 1.5s of
 * inactivity, and avoids clobbering in-progress typing by skipping remote
 * syncs while the user is actively editing.
 */
export function CollaborativeNoteEditor({
    noteId,
    onExit,
}: CollaborativeNoteEditorProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const noteQuery = useQuery<Note>({
        queryKey: ["note", noteId],
        queryFn: () => getNote(noteId).then((r) => r.data),
        refetchInterval: POLL_INTERVAL,
    });

    const collaboratorsQuery = useQuery<NoteCollaborator[]>({
        queryKey: ["note-collaborators", noteId],
        queryFn: () => getNoteCollaborators(noteId).then((r) => r.data),
        refetchInterval: POLL_INTERVAL,
    });

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [saving, setSaving] = useState(false);

    const lastKeystroke = useRef<number>(0);
    const appliedUpdate = useRef<string | null>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Apply remote note data when the server reports a newer version and the
    // user hasn't typed recently (avoids overwriting in-progress edits).
    useEffect(() => {
        const remote = noteQuery.data;
        if (!remote) return;
        const remoteKey = remote.updatedAt;
        if (appliedUpdate.current === remoteKey) return;
        const idle = Date.now() - lastKeystroke.current;
        if (lastKeystroke.current > 0 && idle < EDIT_GRACE) return;
        setTitle(remote.title);
        setContent(remote.content);
        appliedUpdate.current = remoteKey;
        setLastSync(new Date());
    }, [noteQuery.data]);

    const saveMutation = useMutation({
        mutationFn: (vars: { title: string; content: string }) =>
            updateNote(noteId, vars),
        onMutate: () => setSaving(true),
        onSuccess: (res) => {
            appliedUpdate.current = res.data.updatedAt;
            setLastSync(new Date());
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            setSaving(false);
        },
        onError: () => setSaving(false),
    });

    // Debounced auto-save: fire SAVE_DEBOUNCE after the last keystroke, but
    // only if local content diverges from the server.
    useEffect(() => {
        if (!noteQuery.data) return;
        const remote = noteQuery.data;
        const changed =
            title !== remote.title || content !== remote.content;
        if (!changed) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveMutation.mutate({ title, content });
        }, SAVE_DEBOUNCE);
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [title, content, noteQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTitleChange = (value: string) => {
        lastKeystroke.current = Date.now();
        setTitle(value);
    };

    const handleContentChange = (value: string) => {
        lastKeystroke.current = Date.now();
        setContent(value);
    };

    const handleManualSave = () => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveMutation.mutate({ title, content });
    };

    if (noteQuery.isLoading) {
        return (
            <Card padding="lg" className={styles.container}>
                <Spinner size="small" />
            </Card>
        );
    }

    if (noteQuery.isError || !noteQuery.data) {
        return (
            <Card padding="lg" className={styles.container}>
                <ErrorState
                    title={t("collaboration.errorTitle")}
                    description={t("collaboration.errorDescription")}
                    onRetry={() => noteQuery.refetch()}
                    retryLabel={t("common.retry")}
                />
            </Card>
        );
    }

    const collaborators = collaboratorsQuery.data ?? [];
    const isOwner = noteQuery.data.userId === user?.userId;
    const syncLabel = lastSync
        ? t("collaboration.syncedAt", {
              time: lastSync.toLocaleTimeString(),
          })
        : t("collaboration.syncing");

    return (
        <Card padding="lg" className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <PeopleTeam24Regular />
                    </span>
                    <div>
                        <h2 className={styles.title}>
                            {t("collaboration.title")}
                        </h2>
                        <p className={styles.subtitle}>
                            {t("collaboration.subtitle")}
                        </p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    {saving && (
                        <Badge variant="warning">
                            {t("collaboration.saving")}
                        </Badge>
                    )}
                    {!saving && lastSync && (
                        <Badge variant="success">
                            {t("collaboration.synced")}
                        </Badge>
                    )}
                    <Button
                        variant="subtle"
                        size="small"
                        icon={<Save24Regular />}
                        onClick={handleManualSave}
                        loading={saveMutation.isPending}
                    >
                        {t("common.save")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<ArrowExit24Regular />}
                        onClick={onExit}
                    >
                        {t("collaboration.exit")}
                    </Button>
                </div>
            </div>

            <div className={styles.layout}>
                <div className={styles.editorPane}>
                    <Input
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder={t("notes.titleField")}
                        wrapperClassName={styles.titleInput}
                        size="large"
                    />
                    <Textarea
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder={t("notes.contentPlaceholder")}
                        className={styles.contentField}
                        resize="vertical"
                    />
                    <p className={styles.syncLabel}>{syncLabel}</p>
                </div>

                <aside className={styles.collabPane}>
                    <div className={styles.collabHeader}>
                        <h3 className={styles.collabTitle}>
                            {t("collaboration.collaborators")}
                        </h3>
                        {collaborators.length > 0 && (
                            <Badge variant="neutral">
                                {collaborators.length}
                            </Badge>
                        )}
                    </div>
                    {collaboratorsQuery.isLoading && <Spinner size="tiny" />}
                    {!collaboratorsQuery.isLoading &&
                        collaborators.length === 0 && (
                            <p className={styles.collabEmpty}>
                                {t("collaboration.noCollaborators")}
                            </p>
                        )}
                    <ul className={styles.collabList}>
                        {/* The owner is always shown even if not yet seeded in
                            the collaborators table. */}
                        {!collaborators.some(
                            (c) => c.userId === noteQuery.data!.userId,
                        ) && (
                            <li className={styles.collabItem}>
                                <span className={styles.collabName}>
                                    {t("collaboration.you")}
                                    {isOwner
                                        ? ""
                                        : ` · ${noteQuery.data!.userId}`}
                                </span>
                                <Badge variant="accent">
                                    {t("collaboration.roleOwner")}
                                </Badge>
                            </li>
                        )}
                        {collaborators.map((c) => (
                            <li key={c.id} className={styles.collabItem}>
                                <span className={styles.collabName}>
                                    {c.userId === user?.userId
                                        ? t("collaboration.you")
                                        : c.userName}
                                </span>
                                <Badge
                                    variant={
                                        c.role === "OWNER"
                                            ? "accent"
                                            : c.role === "EDITOR"
                                              ? "success"
                                              : "neutral"
                                    }
                                >
                                    {c.role === "OWNER"
                                        ? t("collaboration.roleOwner")
                                        : c.role === "EDITOR"
                                          ? t("collaboration.roleEditor")
                                          : t("collaboration.roleViewer")}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                    {isOwner && (
                        <p className={styles.collabHint}>
                            {t("collaboration.inviteHint")}
                        </p>
                    )}
                </aside>
            </div>
        </Card>
    );
}
