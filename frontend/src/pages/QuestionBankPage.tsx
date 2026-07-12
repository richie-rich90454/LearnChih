import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Spinner,
    Textarea,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import {
    ArrowLeft24Regular,
    Add24Regular,
    Search24Regular,
    Delete24Regular,
    Edit24Regular,
    ArrowImport24Regular,
    Apps24Regular,
    CheckmarkCircle24Regular,
    Dismiss24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    useQuestionBank,
    useCreateQuestionBank,
    useUpdateQuestionBank,
    useDeleteQuestionBank,
    useImportQuestion,
    useQuizzesForImport,
    type QuestionBankItem,
    type QuestionBankPayload,
} from "../hooks/useQuestionBank";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import stateStyles from "@/components/States.module.css";
import styles from "./QuestionBankPage.module.css";

interface FormState {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    tags: string;
}

const EMPTY_FORM: FormState = {
    question: "",
    options: ["", "", "", ""],
    answerIndex: 0,
    explanation: "",
    tags: "",
};

export default function QuestionBankPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { dispatchToast } = useToastController();

    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [editing, setEditing] = useState<QuestionBankItem | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [importTarget, setImportTarget] = useState<QuestionBankItem | null>(null);
    const [importQuizId, setImportQuizId] = useState<string>("");

    const tagParam = tagFilter.trim() || undefined;
    const queryParam = search.trim() || undefined;
    const { data: items, isLoading, isError, refetch } = useQuestionBank(tagParam, queryParam);
    const { data: quizzes } = useQuizzesForImport();

    const createMutation = useCreateQuestionBank();
    const updateMutation = useUpdateQuestionBank();
    const deleteMutation = useDeleteQuestionBank();
    const importMutation = useImportQuestion();

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormOpen(true);
    };

    const openEdit = (item: QuestionBankItem) => {
        setEditing(item);
        setForm({
            question: item.question,
            options: item.options.length >= 2 ? [...item.options] : ["", ""],
            answerIndex: item.answerIndex,
            explanation: item.explanation ?? "",
            tags: item.tags,
        });
        setFormOpen(true);
    };

    const notify = (title: string) => {
        dispatchToast(<Toast><ToastTitle>{title}</ToastTitle></Toast>, { intent: "success" });
    };

    const handleSave = () => {
        const payload: QuestionBankPayload = {
            question: form.question,
            options: form.options.map((o) => o.trim()).filter((o) => o.length > 0),
            answerIndex: form.answerIndex,
            explanation: form.explanation || undefined,
            tags: form.tags || undefined,
        };
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, payload },
                {
                    onSuccess: () => {
                        notify(t("questionBank.saved"));
                        setFormOpen(false);
                    },
                },
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    notify(t("questionBank.saved"));
                    setFormOpen(false);
                },
            });
        }
    };

    const handleDelete = (item: QuestionBankItem) => {
        deleteMutation.mutate(item.id, {
            onSuccess: () => notify(t("questionBank.deleted")),
        });
    };

    const handleImport = () => {
        if (!importTarget || !importQuizId) return;
        importMutation.mutate(
            { id: importTarget.id, quizId: Number(importQuizId) },
            {
                onSuccess: () => {
                    notify(t("questionBank.imported"));
                    setImportTarget(null);
                    setImportQuizId("");
                },
            },
        );
    };

    const setOption = (idx: number, value: string) => {
        setForm((f) => {
            const options = [...f.options];
            options[idx] = value;
            return { ...f, options };
        });
    };

    const addOption = () => {
        setForm((f) => ({ ...f, options: [...f.options, ""] }));
    };

    const removeOption = (idx: number) => {
        setForm((f) => {
            if (f.options.length <= 2) return f;
            const options = f.options.filter((_, i) => i !== idx);
            const answerIndex = idx < f.answerIndex
                ? f.answerIndex - 1
                : Math.min(f.answerIndex, options.length - 1);
            return { ...f, options, answerIndex };
        });
    };

    const tagsList = (tags: string) =>
        tags.split(",").map((s) => s.trim()).filter(Boolean);

    const saving = createMutation.isPending || updateMutation.isPending;

    return (
        <main className={styles.container}>
            <Seo
                title={`${t("questionBank.title")} — LernChih`}
                description={t("questionBank.description")}
                canonicalPath="/question-bank"
            />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <h1 className={styles.title}>{t("questionBank.title")}</h1>
                <div className={styles.headerActions}>
                    <Button variant="primary" icon={<Add24Regular />} onClick={openCreate}>
                        {t("questionBank.new")}
                    </Button>
                </div>
            </div>

            <p className={styles.subtitle}>{t("questionBank.description")}</p>

            <div className={styles.searchRow}>
                <Input
                    wrapperClassName={styles.searchInput}
                    contentBefore={<Search24Regular />}
                    placeholder={t("questionBank.searchPlaceholder")}
                    value={search}
                    onChange={(_, d) => setSearch(d.value)}
                />
                <Input
                    wrapperClassName={styles.tagInput}
                    placeholder={t("questionBank.tagPlaceholder")}
                    value={tagFilter}
                    onChange={(_, d) => setTagFilter(d.value)}
                />
            </div>

            {isLoading && (
                <div className={stateStyles.loading} role="status" aria-live="polite">
                    <Spinner />
                    <p className={stateStyles.loadingLabel}>{t("questionBank.loading")}</p>
                </div>
            )}

            {isError && (
                <ErrorState
                    title={t("questionBank.loadError")}
                    description={t("common.error")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            )}

            {!isLoading && !isError && (!items || items.length === 0) && (
                <EmptyState
                    icon={<Apps24Regular />}
                    title={t("questionBank.empty")}
                    description={t("questionBank.emptyDescription")}
                    action={
                        <Button variant="primary" icon={<Add24Regular />} onClick={openCreate}>
                            {t("questionBank.new")}
                        </Button>
                    }
                />
            )}

            {!isLoading && !isError && items && items.length > 0 && (
                <div className={styles.list}>
                    {items.map((item) => (
                        <Card key={item.id} padding="md" className={styles.questionCard}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.questionText}>{item.question}</h2>
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<ArrowImport24Regular />}
                                        onClick={() => {
                                            setImportTarget(item);
                                            setImportQuizId("");
                                        }}
                                    >
                                        {t("questionBank.import")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Edit24Regular />}
                                        onClick={() => openEdit(item)}
                                    >
                                        {t("common.edit")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => handleDelete(item)}
                                    >
                                        {t("common.delete")}
                                    </Button>
                                </div>
                            </div>
                            <ul className={styles.optionList}>
                                {item.options.map((opt, i) => (
                                    <li
                                        key={i}
                                        className={
                                            i === item.answerIndex
                                                ? styles.optionCorrect
                                                : styles.option
                                        }
                                    >
                                        {i === item.answerIndex && (
                                            <CheckmarkCircle24Regular className={styles.checkIcon} />
                                        )}
                                        <span>{opt}</span>
                                    </li>
                                ))}
                            </ul>
                            {item.explanation && (
                                <p className={styles.explanation}>{item.explanation}</p>
                            )}
                            {tagsList(item.tags).length > 0 && (
                                <div className={styles.tagRow}>
                                    {tagsList(item.tags).map((tag) => (
                                        <Badge key={tag} variant="accent">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Create / Edit dialog */}
            <Dialog open={formOpen} onOpenChange={(_, d) => setFormOpen(d.open)}>
                <DialogSurface className={styles.dialogSurface}>
                    <DialogBody className={styles.dialogBody}>
                        <DialogTitle
                            action={
                                <DialogTrigger disableButtonEnhancement>
                                    <Button
                                        variant="subtle"
                                        appearance="subtle"
                                        icon={<Dismiss24Regular />}
                                        aria-label={t("common.close")}
                                    />
                                </DialogTrigger>
                            }
                        >
                            {editing ? t("questionBank.editTitle") : t("questionBank.createTitle")}
                        </DialogTitle>
                        <DialogContent className={styles.dialogContent}>
                            <Textarea
                                className={styles.questionField}
                                placeholder={t("questionBank.questionPlaceholder")}
                                value={form.question}
                                onChange={(_, d) => setForm((f) => ({ ...f, question: d.value }))}
                                aria-label={t("questionBank.questionPlaceholder")}
                            />
                            <div className={styles.optionsSection}>
                                <span className={styles.optionsLabel}>
                                    {t("questionBank.optionsLabel")}
                                </span>
                                {form.options.map((opt, idx) => (
                                    <div key={idx} className={styles.optionEditor}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="answerIndex"
                                                checked={form.answerIndex === idx}
                                                onChange={() =>
                                                    setForm((f) => ({ ...f, answerIndex: idx }))
                                                }
                                            />
                                        </label>
                                        <Input
                                            wrapperClassName={styles.optionInput}
                                            placeholder={`${t("questionBank.option")} ${idx + 1}`}
                                            value={opt}
                                            onChange={(_, d) => setOption(idx, d.value)}
                                        />
                                        {form.options.length > 2 && (
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<Dismiss24Regular />}
                                                onClick={() => removeOption(idx)}
                                                aria-label={t("common.delete")}
                                            />
                                        )}
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="small"
                                    icon={<Add24Regular />}
                                    onClick={addOption}
                                >
                                    {t("questionBank.addOption")}
                                </Button>
                            </div>
                            <Textarea
                                className={styles.explanationField}
                                placeholder={t("questionBank.explanationPlaceholder")}
                                value={form.explanation}
                                onChange={(_, d) =>
                                    setForm((f) => ({ ...f, explanation: d.value }))
                                }
                                aria-label={t("questionBank.explanationPlaceholder")}
                            />
                            <Input
                                label={t("questionBank.tagsLabel")}
                                placeholder={t("questionBank.tagsPlaceholder")}
                                value={form.tags}
                                onChange={(_, d) => setForm((f) => ({ ...f, tags: d.value }))}
                            />
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button variant="subtle">{t("common.cancel")}</Button>
                            </DialogTrigger>
                            <Button
                                variant="primary"
                                loading={saving}
                                onClick={handleSave}
                            >
                                {t("common.save")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Import dialog */}
            <Dialog
                open={importTarget !== null}
                onOpenChange={(_, d) => {
                    if (!d.open) {
                        setImportTarget(null);
                        setImportQuizId("");
                    }
                }}
            >
                <DialogSurface className={styles.dialogSurface}>
                    <DialogBody className={styles.dialogBody}>
                        <DialogTitle
                            action={
                                <Button
                                    variant="subtle"
                                    appearance="subtle"
                                    icon={<Dismiss24Regular />}
                                    onClick={() => {
                                        setImportTarget(null);
                                        setImportQuizId("");
                                    }}
                                    aria-label={t("common.close")}
                                />
                            }
                        >
                            {t("questionBank.importTitle")}
                        </DialogTitle>
                        <DialogContent className={styles.dialogContent}>
                            <p className={styles.importHint}>
                                {t("questionBank.importHint")}
                            </p>
                            <Select
                                label={t("questionBank.selectQuiz")}
                                value={importQuizId}
                                onChange={(_, d) => setImportQuizId(String(d.value))}
                            >
                                <Option value="">
                                    {t("questionBank.selectQuiz")}
                                </Option>
                                {(quizzes ?? []).map((q) => (
                                    <Option key={q.id} value={String(q.id)}>
                                        {q.title}
                                    </Option>
                                ))}
                            </Select>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="subtle"
                                onClick={() => {
                                    setImportTarget(null);
                                    setImportQuizId("");
                                }}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                loading={importMutation.isPending}
                                disabled={!importQuizId}
                                onClick={handleImport}
                            >
                                {t("questionBank.import")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </main>
    );
}
