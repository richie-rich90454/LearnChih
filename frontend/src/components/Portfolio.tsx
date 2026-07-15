import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Textarea,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Field,
    Spinner,
} from "@fluentui/react-components";
import { Add24Regular, Edit24Regular, Delete24Regular } from "@fluentui/react-icons";
import {
    usePortfolio,
    useCreatePortfolioItem,
    useUpdatePortfolioItem,
    useDeletePortfolioItem,
} from "@/hooks/usePortfolio";
import type { PortfolioItem } from "@/api/portfolio";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./Portfolio.module.css";

interface PortfolioProps {
    userId: number;
    /** Whether the viewer is the profile owner and may edit the portfolio. */
    editable: boolean;
}

interface FormState {
    title: string;
    description: string;
    url: string;
}

const EMPTY_FORM: FormState = { title: "", description: "", url: "" };

/**
 * A curated portfolio of work/items showcased on a user's profile (F35).
 * The owner can add, edit, and reorder items; other viewers see a read-only
 * list.
 */
export function Portfolio({ userId, editable }: PortfolioProps) {
    const { t } = useTranslation();
    const { data, isLoading } = usePortfolio(userId);
    const create = useCreatePortfolioItem(userId);
    const update = useUpdatePortfolioItem(userId);
    const remove = useDeletePortfolioItem(userId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const items = data ?? [];

    const openAdd = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (item: PortfolioItem) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            description: item.description ?? "",
            url: item.url ?? "",
        });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!form.title.trim()) return;
        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            url: form.url.trim() || undefined,
        };
        if (editingId != null) {
            update.mutate(
                { id: editingId, data: payload },
                { onSuccess: () => setDialogOpen(false) },
            );
        } else {
            create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
        }
    };

    const pending = create.isPending || update.isPending;

    return (
        <Card padding="lg" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("portfolio.title")}</h2>
                {editable && (
                    <Button
                        variant="subtle"
                        icon={<Add24Regular />}
                        onClick={openAdd}
                    >
                        {t("portfolio.add")}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className={styles.loading} role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner size="tiny" />
                </div>
            ) : items.length === 0 ? (
                <p className={styles.empty}>{t("portfolio.empty")}</p>
            ) : (
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                            <div className={styles.itemBody}>
                                <div className={styles.itemHeading}>
                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.itemLink}
                                        >
                                            {t("portfolio.open")}
                                            <span className="visually-hidden">{t("a11y.opensInNewWindow")}</span>
                                        </a>
                                    )}
                                </div>
                                {item.description && (
                                    <p className={styles.itemDesc}>{item.description}</p>
                                )}
                            </div>
                            {editable && (
                                <div className={styles.itemActions}>
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        icon={<Edit24Regular />}
                                        onClick={() => openEdit(item)}
                                        aria-label={t("portfolio.edit")}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => remove.mutate(item.id)}
                                        aria-label={t("portfolio.delete")}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {editingId != null
                                ? t("portfolio.editItem")
                                : t("portfolio.addItem")}
                        </DialogTitle>
                        <DialogContent>
                            <div className={styles.form}>
                                <Input
                                    label={t("portfolio.fieldTitle")}
                                    value={form.title}
                                    onChange={(_e, data) =>
                                        setForm((f) => ({ ...f, title: data.value }))
                                    }
                                    placeholder={t("portfolio.fieldTitlePlaceholder")}
                                    aria-required="true"
                                />
                                <Field label={t("portfolio.fieldDescription")}>
                                    <Textarea
                                        value={form.description}
                                        onChange={(_e, data) =>
                                            setForm((f) => ({
                                                ...f,
                                                description: data.value,
                                            }))
                                        }
                                        placeholder={t(
                                            "portfolio.fieldDescriptionPlaceholder",
                                        )}
                                    />
                                </Field>
                                <Input
                                    label={t("portfolio.fieldUrl")}
                                    value={form.url}
                                    onChange={(_e, data) =>
                                        setForm((f) => ({ ...f, url: data.value }))
                                    }
                                    placeholder={t("portfolio.fieldUrlPlaceholder")}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="subtle"
                                onClick={() => setDialogOpen(false)}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={pending || !form.title.trim()}
                                /* B-ui-174: preserve accessible name while
                                   the pending Spinner replaces the label. */
                                aria-label={
                                    pending ? t("common.save") : undefined
                                }
                            >
                                {pending ? <Spinner size="tiny" /> : t("common.save")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </Card>
    );
}

export default Portfolio;
