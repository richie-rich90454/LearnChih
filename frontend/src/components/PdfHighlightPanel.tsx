import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, Textarea } from "@fluentui/react-components";
import {
    Highlight24Regular,
    Add24Regular,
    Delete24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getPdfHighlights,
    createPdfHighlight,
    updatePdfHighlight,
    deletePdfHighlight,
    type PdfHighlight,
} from "@/api/pdfHighlights";
import Seo from "@/components/Seo";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import styles from "./PdfHighlightPanel.module.css";

interface PdfHighlightPanelProps {
    resourceId: number;
}

const COLORS = ["yellow", "green", "blue", "pink", "orange"];

/**
 * Panel for viewing and managing PDF highlights on a resource (F12). Shows
 * existing highlights grouped by page, and an inline form to add new ones.
 */
export function PdfHighlightPanel({ resourceId }: PdfHighlightPanelProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [adding, setAdding] = useState(false);
    const [formPage, setFormPage] = useState("1");
    const [formText, setFormText] = useState("");
    const [formColor, setFormColor] = useState("yellow");
    const [formNote, setFormNote] = useState("");

    const query = useQuery<PdfHighlight[]>({
        queryKey: ["pdf-highlights", resourceId],
        queryFn: () => getPdfHighlights(resourceId).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createPdfHighlight({
                resourceId,
                pageNumber: parseInt(formPage, 10) || 1,
                highlightedText: formText,
                color: formColor,
                note: formNote || null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["pdf-highlights", resourceId],
            });
            setAdding(false);
            setFormText("");
            setFormNote("");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number; note: string }) =>
            updatePdfHighlight(vars.id, { note: vars.note }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["pdf-highlights", resourceId],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePdfHighlight(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["pdf-highlights", resourceId],
            });
        },
    });

    const highlights = query.data ?? [];

    const handleAdd = () => {
        if (!formText.trim()) return;
        createMutation.mutate();
    };

    return (
        <Card padding="lg" className={styles.panel}>
            <Seo
                title={`${t("pdfHighlights.title")} — LernChih`}
                description={t("pdfHighlights.subtitle")}
                canonicalPath={`/resources/${resourceId}`}
            />
            <div className={styles.header}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <Highlight24Regular />
                    </span>
                    <div>
                        <h2 className={styles.title}>{t("pdfHighlights.title")}</h2>
                        <p className={styles.subtitle}>{t("pdfHighlights.subtitle")}</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => setAdding((v) => !v)}
                    aria-pressed={adding}
                >
                    {t("pdfHighlights.add")}
                </Button>
            </div>

            {adding && (
                <div className={styles.form}>
                    <div className={styles.formRow}>
                        <Input
                            type="number"
                            value={formPage}
                            onChange={(e) => setFormPage(e.target.value)}
                            label={t("pdfHighlights.pageNumber")}
                            wrapperClassName={styles.pageInput}
                            min={1}
                        />
                        <div className={styles.colorPicker}>
                            <span className={styles.colorLabel}>
                                {t("pdfHighlights.color")}
                            </span>
                            <div
                                className={styles.colorSwatches}
                                role="radiogroup"
                                aria-label={t("pdfHighlights.color")}
                            >
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={
                                            formColor === c
                                                ? styles.swatchActive
                                                : styles.swatch
                                        }
                                        style={{ background: `var(--highlight-${c})` }}
                                        onClick={() => setFormColor(c)}
                                        role="radio"
                                        aria-checked={formColor === c}
                                        aria-label={t("pdfHighlights.colorOption", {
                                            defaultValue: "{{color}}",
                                            color: c,
                                        })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <Textarea
                        value={formText}
                        onChange={(e) => setFormText(e.target.value)}
                        placeholder={t("pdfHighlights.textPlaceholder")}
                        className={styles.textArea}
                        aria-label={t("pdfHighlights.textPlaceholder")}
                        resize="vertical"
                    />
                    <Textarea
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder={t("pdfHighlights.notePlaceholder")}
                        className={styles.noteArea}
                        aria-label={t("pdfHighlights.notePlaceholder")}
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
                            disabled={!formText.trim()}
                        >
                            {t("common.save")}
                        </Button>
                    </div>
                </div>
            )}

            {query.isLoading && (
                <div role="status" aria-live="polite">
                    <Spinner size="small" />
                </div>
            )}
            {query.isError && (
                <ErrorState
                    title={t("pdfHighlights.errorTitle")}
                    description={t("pdfHighlights.errorDescription")}
                    onRetry={() => query.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!query.isLoading && !query.isError && highlights.length === 0 && !adding && (
                <p className={styles.empty}>{t("pdfHighlights.empty")}</p>
            )}
            <ul className={styles.list}>
                {highlights.map((h) => (
                    <li key={h.id} className={styles.highlightItem}>
                        <div className={styles.highlightHeader}>
                            <Badge variant="neutral">
                                {t("pdfHighlights.page")} {h.pageNumber}
                            </Badge>
                            {h.color && (
                                <span
                                    className={styles.colorDot}
                                    style={{ background: `var(--highlight-${h.color})` }}
                                    aria-label={h.color}
                                />
                            )}
                            <Button
                                variant="ghost"
                                size="small"
                                icon={<Delete24Regular />}
                                onClick={() => deleteMutation.mutate(h.id)}
                                loading={deleteMutation.isPending}
                                className={styles.deleteBtn}
                                aria-label={t("pdfHighlights.delete", "Delete highlight")}
                            />
                        </div>
                        <blockquote className={styles.highlightText}>
                            {h.highlightedText}
                        </blockquote>
                        <Textarea
                            defaultValue={h.note ?? ""}
                            placeholder={t("pdfHighlights.notePlaceholder")}
                            className={styles.highlightNote}
                            aria-label={t("pdfHighlights.notePlaceholder")}
                            onBlur={(e) => {
                                if (e.target.value !== (h.note ?? "")) {
                                    updateMutation.mutate({
                                        id: h.id,
                                        note: e.target.value,
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
