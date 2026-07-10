import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Textarea } from "@fluentui/react-components";
import {
    CommentNote24Regular,
    Add24Regular,
    Delete24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    type Annotation,
} from "@/api/annotations";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./AnnotationPanel.module.css";

interface AnnotationPanelProps {
    resourceId: number;
}

/**
 * Panel for viewing and managing inline annotations on a resource (F13).
 * Each annotation anchors a quote and attaches the user's comment. The
 * inline form lets users add new annotations; existing ones are editable.
 */
export function AnnotationPanel({ resourceId }: AnnotationPanelProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [adding, setAdding] = useState(false);
    const [formQuote, setFormQuote] = useState("");
    const [formContent, setFormContent] = useState("");

    const query = useQuery<Annotation[]>({
        queryKey: ["annotations", resourceId],
        queryFn: () => getAnnotations(resourceId).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createAnnotation({
                resourceId,
                quote: formQuote,
                content: formContent,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["annotations", resourceId],
            });
            setAdding(false);
            setFormQuote("");
            setFormContent("");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number; content: string }) =>
            updateAnnotation(vars.id, { content: vars.content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["annotations", resourceId],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteAnnotation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["annotations", resourceId],
            });
        },
    });

    const annotations = query.data ?? [];

    const handleAdd = () => {
        if (!formQuote.trim() || !formContent.trim()) return;
        createMutation.mutate();
    };

    return (
        <Card padding="lg" className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <CommentNote24Regular />
                    </span>
                    <div>
                        <h2 className={styles.title}>{t("annotations.title")}</h2>
                        <p className={styles.subtitle}>
                            {t("annotations.subtitle")}
                        </p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => setAdding((v) => !v)}
                >
                    {t("annotations.add")}
                </Button>
            </div>

            {adding && (
                <div className={styles.form}>
                    <Textarea
                        value={formQuote}
                        onChange={(e) => setFormQuote(e.target.value)}
                        placeholder={t("annotations.quotePlaceholder")}
                        className={styles.quoteArea}
                        resize="vertical"
                    />
                    <Textarea
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder={t("annotations.contentPlaceholder")}
                        className={styles.contentArea}
                        resize="vertical"
                    />
                    <div className={styles.formActions}>
                        <Button
                            variant="subtle"
                            size="small"
                            onClick={() => setAdding(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            size="small"
                            onClick={handleAdd}
                            loading={createMutation.isPending}
                            disabled={!formQuote.trim() || !formContent.trim()}
                        >
                            {t("common.save")}
                        </Button>
                    </div>
                </div>
            )}

            {query.isLoading && <Spinner size="small" />}
            {query.isError && (
                <ErrorState
                    title={t("annotations.errorTitle")}
                    description={t("annotations.errorDescription")}
                    onRetry={() => query.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!query.isLoading && !query.isError && annotations.length === 0 && !adding && (
                <p className={styles.empty}>{t("annotations.empty")}</p>
            )}
            <ul className={styles.list}>
                {annotations.map((a) => (
                    <li key={a.id} className={styles.annotationItem}>
                        <div className={styles.annotationHeader}>
                            <blockquote className={styles.quote}>
                                {a.quote}
                            </blockquote>
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<Delete24Regular />}
                                onClick={() => deleteMutation.mutate(a.id)}
                                loading={deleteMutation.isPending}
                                className={styles.deleteBtn}
                            />
                        </div>
                        <Textarea
                            defaultValue={a.content}
                            placeholder={t("annotations.contentPlaceholder")}
                            className={styles.annotationContent}
                            onBlur={(e) => {
                                if (e.target.value !== a.content) {
                                    updateMutation.mutate({
                                        id: a.id,
                                        content: e.target.value,
                                    });
                                }
                            }}
                            resize="vertical"
                        />
                    </li>
                ))}
            </ul>
        </Card>
    );
}
