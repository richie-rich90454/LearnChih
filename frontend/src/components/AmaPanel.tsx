import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ArrowUp24Regular,
    Pin24Regular,
    PinOff24Regular,
    QuestionCircle24Regular,
} from "@fluentui/react-icons";
import { useAmaQuestions, useAmaStore } from "../store/amaStore";
import useAuthStore from "../store/authStore";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import styles from "./AmaPanel.module.css";

interface AmaPanelProps {
    threadId: number;
    /** When true, the current user can pin answers (thread owner). */
    isOwner?: boolean;
}

/**
 * "Ask Me Anything" panel (F48). Renders a list of questions with upvote
 * buttons and (for the thread owner) a "Pin answer" action. Pinned answers
 * are highlighted and sorted to the top. State persists in `amaStore` keyed
 * by threadId, so reloads keep the Q&A.
 *
 * Spec ref: F48.
 */
export function AmaPanel({ threadId, isOwner = false }: AmaPanelProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const questions = useAmaQuestions(threadId);
    const addQuestion = useAmaStore((s) => s.addQuestion);
    const upvote = useAmaStore((s) => s.upvote);
    const pinAnswer = useAmaStore((s) => s.pinAnswer);
    const unpin = useAmaStore((s) => s.unpin);
    const currentUser = useAuthStore((s) => s.user);

    const [draft, setDraft] = useState("");
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerDraft, setAnswerDraft] = useState("");

    const sorted = useMemo(() => {
        return [...questions].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.upvotes - a.upvotes;
        });
    }, [questions]);

    const handleSubmit = () => {
        if (!draft.trim()) return;
        addQuestion(threadId, draft.trim(), currentUser?.name ?? t("common.user", "User"));
        setDraft("");
    };

    const handlePin = (questionId: string) => {
        if (answeringId === questionId) {
            pinAnswer(threadId, questionId, answerDraft.trim());
            setAnsweringId(null);
            setAnswerDraft("");
        } else {
            setAnsweringId(questionId);
            setAnswerDraft("");
        }
    };

    return (
        <Card padding="md" className={styles.root}>
            <div className={styles.header}>
                <span className={styles.icon} aria-hidden="true">
                    <QuestionCircle24Regular />
                </span>
                <h2 className={styles.title}>{t("ama.title", "Ask Me Anything")}</h2>
                <Badge variant="neutral" size="small">
                    {questions.length} {t("ama.questions", "questions")}
                </Badge>
            </div>

            <div className={styles.composer}>
                <textarea
                    className={styles.textArea}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t("ama.askPlaceholder", "Ask a question...")}
                    rows={2}
                    aria-label={t("ama.askPlaceholder", "Ask a question...")}
                />
                <Button
                    variant="primary"
                    size="small"
                    onClick={handleSubmit}
                    disabled={!draft.trim()}
                >
                    {t("ama.ask", "Ask")}
                </Button>
            </div>

            <ul className={styles.list}>
                {sorted.map((question) => (
                    <li
                        key={question.id}
                        className={question.pinned ? styles.questionPinned : styles.question}
                    >
                        <div className={styles.questionTop}>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<ArrowUp24Regular className={reduced ? styles.noAnim : undefined} />}
                                onClick={() => upvote(threadId, question.id)}
                                aria-label={t("ama.upvote", "Upvote")}
                            >
                                {question.upvotes}
                            </Button>
                            <div className={styles.questionBody}>
                                <p className={styles.questionText}>{question.text}</p>
                                <span className={styles.questionMeta}>
                                    {t("common.byAuthor", {
                                        author: question.authorName,
                                        defaultValue: `by ${question.authorName}`,
                                    })}
                                </span>
                            </div>
                            {question.pinned && (
                                <Badge variant="accent" size="small" icon={<Pin24Regular />}>
                                    {t("ama.pinned", "Pinned")}
                                </Badge>
                            )}
                        </div>

                        {question.answer && (
                            <div className={styles.answer}>
                                <span className={styles.answerLabel}>
                                    {t("ama.answer", "Answer")}:
                                </span>
                                <p className={styles.answerText}>{question.answer}</p>
                            </div>
                        )}

                        {answeringId === question.id && (
                            <div className={styles.answerComposer}>
                                <textarea
                                    className={styles.textArea}
                                    value={answerDraft}
                                    onChange={(e) => setAnswerDraft(e.target.value)}
                                    placeholder={t("ama.answerPlaceholder", "Write your answer...")}
                                    rows={2}
                                />
                                <div className={styles.answerActions}>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        onClick={() => {
                                            setAnsweringId(null);
                                            setAnswerDraft("");
                                        }}
                                    >
                                        {t("common.cancel", "Cancel")}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => handlePin(question.id)}
                                        disabled={!answerDraft.trim()}
                                    >
                                        {t("ama.pinAnswer", "Pin answer")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isOwner && answeringId !== question.id && (
                            <div className={styles.ownerActions}>
                                {question.pinned ? (
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<PinOff24Regular />}
                                        onClick={() => unpin(threadId, question.id)}
                                    >
                                        {t("ama.unpin", "Unpin")}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Pin24Regular />}
                                        onClick={() => handlePin(question.id)}
                                    >
                                        {t("ama.pinAnswer", "Pin answer")}
                                    </Button>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
}

export default AmaPanel;
