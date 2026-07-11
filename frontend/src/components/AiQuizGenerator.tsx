import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Spinner,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import { Quiz24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    generateAiQuiz,
    saveAiQuiz,
    type GeneratedQuizQuestion,
    type QuizMode,
} from "../api/aiQuiz";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import { Select, Option } from "./ui/Select";
import styles from "./AiQuizGenerator.module.css";

type Status =
    | "idle"
    | "generating"
    | "ready"
    | "saving"
    | "saved"
    | "error"
    | "empty";

/**
 * AI quiz generator (F5). Renders a "Generate Quiz with AI" action on the
 * resource detail page. Generation calls a mock backend service that derives
 * multiple-choice questions from the resource's content; the user can then
 * name the quiz and persist it.
 */
export default function AiQuizGenerator({
    resourceId,
}: {
    resourceId: number;
}) {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState<GeneratedQuizQuestion[]>([]);
    const [quizTitle, setQuizTitle] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [mode, setMode] = useState<QuizMode>("TIMED");
    const [timeLimit, setTimeLimit] = useState("300");

    const generateMutation = useMutation({
        mutationFn: () => generateAiQuiz(resourceId).then((r) => r.data),
        onMutate: () => setStatus("generating"),
        onSuccess: (data) => {
            if (!data.questions || data.questions.length === 0) {
                setStatus("empty");
            } else {
                setQuestions(data.questions);
                setStatus("ready");
            }
        },
        onError: () => setStatus("error"),
    });

    const saveMutation = useMutation({
        mutationFn: () =>
            saveAiQuiz(resourceId, {
                quizTitle,
                questions,
                mode,
                timeLimitSeconds:
                    mode === "TIMED" ? Number(timeLimit) || undefined : undefined,
            }).then((r) => r.data),
        onMutate: () => setStatus("saving"),
        onSuccess: () => setStatus("saved"),
        onError: () => setStatus("error"),
    });

    const handleReset = () => {
        setQuestions([]);
        setQuizTitle("");
        setStatus("idle");
        setMode("TIMED");
        setTimeLimit("300");
    };

    const showResults =
        (status === "ready" || status === "saving" || status === "saved") &&
        questions.length > 0;

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>{t("aiQuiz.title")}</h2>
                    <p className={styles.description}>
                        {t("aiQuiz.description")}
                    </p>
                </div>
                <Quiz24Regular className={styles.icon} aria-hidden />
            </div>

            {status === "error" && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("aiQuiz.error")}</MessageBarBody>
                </MessageBar>
            )}

            {status === "empty" && (
                <MessageBar intent="info">
                    <MessageBarBody>{t("aiQuiz.empty")}</MessageBarBody>
                </MessageBar>
            )}

            {status === "generating" && (
                <div className={styles.loading}>
                    <Spinner size="tiny" />
                    <span>{t("aiQuiz.generating")}</span>
                </div>
            )}

            {showResults && (
                <>
                    {status === "saved" && (
                        <MessageBar intent="success">
                            <MessageBarBody>{t("aiQuiz.saved")}</MessageBarBody>
                        </MessageBar>
                    )}

                    <ol className={styles.questionList}>
                        {questions.map((q, qi) => (
                            <li key={qi} className={styles.question}>
                                <div className={styles.questionHead}>
                                    <span className={styles.questionLabel}>
                                        {t("aiQuiz.question")} {qi + 1}
                                    </span>
                                </div>
                                <p className={styles.questionText}>
                                    {q.question}
                                </p>
                                <div className={styles.optionsBlock}>
                                    <span className={styles.sideLabel}>
                                        {t("aiQuiz.options")}
                                    </span>
                                    <ul className={styles.optionList}>
                                        {q.options.map((opt, oi) => {
                                            const correct = oi === q.answerIndex;
                                            return (
                                                <li
                                                    key={oi}
                                                    className={
                                                        correct
                                                            ? styles.optionCorrect
                                                            : styles.option
                                                    }
                                                >
                                                    <span className={styles.optionKey}>
                                                        {String.fromCharCode(65 + oi)}
                                                    </span>
                                                    <span className={styles.optionText}>
                                                        {opt}
                                                    </span>
                                                    {correct && (
                                                        <Badge
                                                            variant="success"
                                                            size="small"
                                                        >
                                                            {t("aiQuiz.answer")}
                                                        </Badge>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                {q.explanation && (
                                    <div className={styles.explanationBlock}>
                                        <span className={styles.sideLabel}>
                                            {t("aiQuiz.explanation")}
                                        </span>
                                        <p className={styles.explanationText}>
                                            {q.explanation}
                                        </p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>

                    {status !== "saved" ? (
                        <div className={styles.saveRow}>
                            <Input
                                value={quizTitle}
                                onChange={(_, data) => setQuizTitle(data.value)}
                                placeholder={t("aiQuiz.quizTitle")}
                                wrapperClassName={styles.quizTitleInput}
                            />
                            <Select
                                value={mode}
                                onChange={(_, data) =>
                                    setMode((data.value as QuizMode) ?? "TIMED")
                                }
                                wrapperClassName={styles.modeSelect}
                                aria-label={t("quizzes.modeLabel")}
                            >
                                <Option value="TIMED">{t("quizzes.modeTimed")}</Option>
                                <Option value="MASTERY">{t("quizzes.modeMastery")}</Option>
                                <Option value="ADAPTIVE">{t("quizzes.modeAdaptive")}</Option>
                            </Select>
                            {mode === "TIMED" && (
                                <Input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(_, data) => setTimeLimit(data.value)}
                                    placeholder={t("quizzes.timeLimitLabel")}
                                    wrapperClassName={styles.timeLimitInput}
                                    aria-label={t("quizzes.timeLimitLabel")}
                                />
                            )}
                            <Button
                                variant="primary"
                                onClick={() => saveMutation.mutate()}
                                loading={status === "saving"}
                                disabled={status === "saving"}
                            >
                                {t("aiQuiz.save")}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="subtle"
                            icon={<Quiz24Regular />}
                            onClick={handleReset}
                        >
                            {t("aiQuiz.button")}
                        </Button>
                    )}
                </>
            )}

            {status === "idle" && (
                <Button
                    variant="outline"
                    icon={<Quiz24Regular />}
                    onClick={() => {
                        setStatus("generating");
                        generateMutation.mutate();
                    }}
                >
                    {t("aiQuiz.button")}
                </Button>
            )}
        </Card>
    );
}
