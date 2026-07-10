import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Textarea } from "@fluentui/react-components";
import {
    Document24Regular,
    Add24Regular,
    Delete24Regular,
    Save24Regular,
    Search24Regular,
    ArrowClockwise24Regular,
    PeopleTeam24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    type Note,
} from "@/api/notes";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { BacklinksPanel } from "@/components/BacklinksPanel";
import { TemplateGallery } from "@/components/TemplateGallery";
import { CollaborativeNoteEditor } from "@/components/CollaborativeNoteEditor";
import styles from "./NotesPage.module.css";

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

interface Segment {
    text: string;
    link: boolean;
}

/** Split note content into plain text + wikilink segments for rendering. */
function renderContent(content: string): Segment[] {
    const segments: Segment[] = [];
    let last = 0;
    WIKILINK_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = WIKILINK_RE.exec(content)) !== null) {
        if (match.index > last) {
            segments.push({ text: content.slice(last, match.index), link: false });
        }
        segments.push({ text: match[1], link: true });
        last = match.index + match[0].length;
    }
    if (last < content.length) {
        segments.push({ text: content.slice(last), link: false });
    }
    return segments;
}

function formatUpdated(iso: string): string {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

export default function NotesPage() {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [draftContent, setDraftContent] = useState("");
    const [dirty, setDirty] = useState(false);
    const [collabMode, setCollabMode] = useState(false);

    const query = useQuery<Note[]>({
        queryKey: ["notes", search],
        queryFn: () => getNotes(search || undefined).then((r) => r.data),
    });

    const notes = query.data ?? [];
    const selected = useMemo(
        () => notes.find((n) => n.id === selectedId) ?? null,
        [notes, selectedId],
    );

    // When the selected note changes (or loads), sync the editor fields.
    useEffect(() => {
        if (selected) {
            setDraftTitle(selected.title);
            setDraftContent(selected.content);
            setDirty(false);
        }
    }, [selectedId, selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const createMutation = useMutation({
        mutationFn: (vars?: { title?: string; content?: string }) =>
            createNote({
                title: vars?.title ?? t("notes.untitled"),
                content: vars?.content ?? "",
            }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            setSelectedId(res.data.id);
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("notes.created")}</ToastTitle>
                </Toast>,
                { intent: "success" },
            );
        },
    });

    const saveMutation = useMutation({
        mutationFn: (vars: { id: number; title: string; content: string }) =>
            updateNote(vars.id, { title: vars.title, content: vars.content }),
        onSuccess: () => {
            setDirty(false);
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("notes.saved")}</ToastTitle>
                </Toast>,
                { intent: "success" },
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteNote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            setSelectedId(null);
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("notes.deleted")}</ToastTitle>
                </Toast>,
                { intent: "info" },
            );
        },
    });

    const handleSave = () => {
        if (!selected) return;
        const title = draftTitle.trim() || t("notes.untitled");
        saveMutation.mutate({ id: selected.id, title, content: draftContent });
    };

    const handleSelect = (note: Note) => {
        if (dirty && selected) {
            // Persist pending edits before switching.
            saveMutation.mutate({
                id: selected.id,
                title: draftTitle.trim() || t("notes.untitled"),
                content: draftContent,
            });
        }
        setCollabMode(false);
        setSelectedId(note.id);
    };

    const handleEnterCollab = () => {
        if (dirty && selected) {
            saveMutation.mutate({
                id: selected.id,
                title: draftTitle.trim() || t("notes.untitled"),
                content: draftContent,
            });
        }
        setCollabMode(true);
    };

    const handleWikilinkClick = (title: string) => {
        const target = notes.find(
            (n) => n.title.toLowerCase() === title.toLowerCase(),
        );
        if (target) {
            handleSelect(target);
        } else {
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("notes.notFound", { title })}</ToastTitle>
                </Toast>,
                { intent: "warning" },
            );
        }
    };

    const handleTemplatePick = (content: string, name: string) => {
        createMutation.mutate({ title: name, content });
    };

    const isLoading = query.isLoading;
    const isError = query.isError;
    const segments = useMemo(
        () => renderContent(draftContent),
        [draftContent],
    );

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("notes.title")} — LernChih`}
                description={t("notes.subtitle")}
                canonicalPath="/notes"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <Document24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("notes.title")}</h1>
                        <p className={styles.subtitle}>{t("notes.subtitle")}</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    icon={<Add24Regular />}
                    onClick={() => createMutation.mutate(undefined)}
                    loading={createMutation.isPending}
                >
                    {t("notes.newNote")}
                </Button>
            </header>

            <div className={styles.layout}>
                {/* Note list */}
                <aside className={styles.listPane}>
                    <div className={styles.searchRow}>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("notes.searchPlaceholder")}
                            contentBefore={<Search24Regular />}
                            wrapperClassName={styles.searchInput}
                        />
                    </div>
                    {isLoading && <Spinner size="small" />}
                    {isError && (
                        <ErrorState
                            title={t("error.dashboardTitle")}
                            description={t("error.dashboardDescription")}
                            onRetry={() => query.refetch()}
                            retryLabel={t("common.retry")}
                        />
                    )}
                    {!isLoading && !isError && notes.length === 0 && (
                        <p className={styles.emptyHint}>{t("notes.empty")}</p>
                    )}
                    <ul className={styles.list}>
                        {notes.map((note) => (
                            <li key={note.id}>
                                <button
                                    type="button"
                                    className={
                                        note.id === selectedId
                                            ? styles.listItemActive
                                            : styles.listItem
                                    }
                                    onClick={() => handleSelect(note)}
                                >
                                    <span className={styles.listItemTitle}>
                                        {note.title}
                                    </span>
                                    <span className={styles.listItemMeta}>
                                        {formatUpdated(note.updatedAt)}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Editor */}
                <section className={styles.editorPane}>
                    {!selected ? (
                        <EmptyState
                            icon={<Document24Regular />}
                            title={t("notes.selectTitle")}
                            description={t("notes.selectDescription")}
                        />
                    ) : collabMode ? (
                        <CollaborativeNoteEditor
                            noteId={selected.id}
                            onExit={() => {
                                setCollabMode(false);
                                queryClient.invalidateQueries({
                                    queryKey: ["notes"],
                                });
                            }}
                        />
                    ) : (
                        <Card padding="lg" className={styles.editorCard}>
                            <div className={styles.editorHeader}>
                                <Input
                                    value={draftTitle}
                                    onChange={(e) => {
                                        setDraftTitle(e.target.value);
                                        setDirty(true);
                                    }}
                                    placeholder={t("notes.titleField")}
                                    wrapperClassName={styles.titleInput}
                                    size="large"
                                />
                                <div className={styles.editorActions}>
                                    {dirty && (
                                        <Badge variant="warning">
                                            {t("notes.unsaved")}
                                        </Badge>
                                    )}
                                    <TemplateGallery
                                        onPick={handleTemplatePick}
                                        currentTitle={draftTitle}
                                        currentContent={draftContent}
                                    />
                                    <Button
                                        variant="outline"
                                        size="small"
                                        icon={<PeopleTeam24Regular />}
                                        onClick={handleEnterCollab}
                                    >
                                        {t("notes.collaborate")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<ArrowClockwise24Regular />}
                                        onClick={() => query.refetch()}
                                    >
                                        {t("common.retry")}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        icon={<Save24Regular />}
                                        onClick={handleSave}
                                        loading={saveMutation.isPending}
                                        disabled={!dirty}
                                    >
                                        {t("common.save")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() =>
                                            deleteMutation.mutate(selected.id)
                                        }
                                        loading={deleteMutation.isPending}
                                    >
                                        {t("common.delete")}
                                    </Button>
                                </div>
                            </div>

                            <Textarea
                                value={draftContent}
                                onChange={(e) => {
                                    setDraftContent(e.target.value);
                                    setDirty(true);
                                }}
                                placeholder={t("notes.contentPlaceholder")}
                                className={styles.contentField}
                                resize="vertical"
                            />

                            <div className={styles.previewSection}>
                                <div className={styles.previewHeader}>
                                    <h2 className={styles.previewTitle}>
                                        {t("notes.preview")}
                                    </h2>
                                    <span className={styles.wikilinkHint}>
                                        {t("notes.wikilinkHint")}
                                    </span>
                                </div>
                                <div className={styles.preview}>
                                    {segments.length === 0 ||
                                    (segments.length === 1 &&
                                        !segments[0].text) ? (
                                        <span className={styles.previewEmpty}>
                                            {t("notes.previewEmpty")}
                                        </span>
                                    ) : (
                                        segments.map((seg, i) =>
                                            seg.link ? (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className={styles.wikilink}
                                                    onClick={() =>
                                                        handleWikilinkClick(
                                                            seg.text,
                                                        )
                                                    }
                                                >
                                                    {seg.text}
                                                </button>
                                            ) : (
                                                <span key={i}>{seg.text}</span>
                                            ),
                                        )
                                    )}
                                </div>
                            </div>

                            <BacklinksPanel
                                currentTitle={selected.title}
                                notes={notes}
                                onSelect={handleSelect}
                            />
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
