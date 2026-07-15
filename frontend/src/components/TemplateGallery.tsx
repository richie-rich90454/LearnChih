import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as FluentButton,
    Spinner,
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { CalendarTemplate24Regular, Delete24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getNoteTemplates,
    createNoteTemplate,
    deleteNoteTemplate,
    type NoteTemplate,
} from "@/api/noteTemplates";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./TemplateGallery.module.css";

interface TemplateGalleryProps {
    /** Called when the user picks a template; receives its content + name. */
    onPick: (content: string, name: string) => void;
    /** Current note title (used when saving as a template). */
    currentTitle: string;
    /** Current note content (used when saving as a template). */
    currentContent: string;
}

/**
 * A dialog-based gallery of note templates (F11). Shows system templates and
 * the user's saved templates as a grid of cards. Clicking a card instantiates
 * a new note with the template body.
 */
export function TemplateGallery({
    onPick,
    currentTitle,
    currentContent,
}: TemplateGalleryProps) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const query = useQuery<NoteTemplate[]>({
        queryKey: ["note-templates"],
        queryFn: () => getNoteTemplates().then((r) => r.data),
        enabled: open,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteNoteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["note-templates"] });
        },
    });

    const saveMutation = useMutation({
        mutationFn: () =>
            createNoteTemplate({
                name: currentTitle.trim() || t("notes.untitled"),
                content: currentContent,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["note-templates"] });
            dispatchToast(
                <Toast>
                    <ToastTitle>{t("notes.templateSaved")}</ToastTitle>
                </Toast>,
                { intent: "success" },
            );
        },
    });

    const handlePick = (template: NoteTemplate) => {
        onPick(template.content, template.name);
        setOpen(false);
    };

    const templates = query.data ?? [];

    return (
        <Dialog open={open} onOpenChange={(_, e) => setOpen(e.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button
                    variant="outline"
                    size="small"
                    icon={<CalendarTemplate24Regular />}
                >
                    {t("notes.templates")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody className={styles.body}>
                    <DialogTitle>{t("notes.templateGallery")}</DialogTitle>
                    <DialogContent className={styles.content}>
                        {query.isLoading && (
                            <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                                <Spinner size="small" aria-hidden="true" />
                            </div>
                        )}
                        {query.isError && (
                            <p className={styles.error}>{t("notes.templateError")}</p>
                        )}
                        {!query.isLoading && !query.isError && templates.length === 0 && (
                            <p className={styles.empty}>{t("notes.templateEmpty")}</p>
                        )}
                        <div className={styles.grid}>
                            {templates.map((template) => (
                                <div key={template.id} className={styles.card}>
                                    <button
                                        type="button"
                                        className={styles.cardButton}
                                        onClick={() => handlePick(template)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardName}>
                                                {template.name}
                                            </span>
                                            {template.category && (
                                                <Badge variant="accent">
                                                    {template.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <pre className={styles.cardPreview}>
                                            {template.content.slice(0, 200)}
                                            {template.content.length > 200 && "…"}
                                        </pre>
                                    </button>
                                    {template.userId !== null && (
                                        <FluentButton
                                            appearance="subtle"
                                            size="small"
                                            className={styles.deleteBtn}
                                            icon={<Delete24Regular />}
                                            onClick={() =>
                                                deleteMutation.mutate(template.id)
                                            }
                                            aria-label={t("notes.deleteTemplate")}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <FluentButton
                            appearance="subtle"
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending}
                        >
                            {t("notes.saveCurrentAsTemplate")}
                        </FluentButton>
                        <DialogTrigger disableButtonEnhancement>
                            <FluentButton appearance="primary">
                                {t("common.close")}
                            </FluentButton>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
