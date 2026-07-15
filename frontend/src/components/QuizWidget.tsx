import { useEffect, useRef, useState } from "react";
import {
    makeStyles,
    tokens,
    Card,
    Button,
    Text,
    Title3,
    Subtitle2,
    Caption1,
    Spinner,
    Badge,
} from "@fluentui/react-components";
import { CheckmarkCircle24Regular, DismissCircle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useQuiz, useSubmitQuiz, type QuizAnswer, type QuizMode } from "../hooks/useQuizzes";

const MAX_MASTERY_ROUNDS = 3;

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "700px",
        margin: "0 auto",
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacingHorizontalM,
        flexWrap: "wrap",
    },
    metaLeft: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    questionCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    options: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    option: {
        justifyContent: "flex-start",
        textAlign: "left",
    },
    resultCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalS,
        textAlign: "center",
    },
    detailRow: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        marginBottom: "var(--space-2)",
    },
    feedback: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    empty: {
        textAlign: "center",
        color: tokens.colorNeutralForeground3,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalS,
    },
});

interface QuizWidgetProps {
    quizId: string | number;
}

export default function QuizWidget({ quizId }: QuizWidgetProps) {
    const styles = useStyles();
    const { t } = useTranslation();
    const { data: quiz, isLoading } = useQuiz(quizId);
    const submitQuiz = useSubmitQuiz(quizId);

    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [queue, setQueue] = useState<number[]>([]);
    const [pos, setPos] = useState(0);
    const [checked, setChecked] = useState(false);
    const [wrongCounts, setWrongCounts] = useState<Record<number, number>>({});
    const [requeued, setRequeued] = useState<Set<number>>(new Set());
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [started, setStarted] = useState(false);

    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const submittedRef = useRef(false);

    const result = submitQuiz.data?.data;

    // Initialize queue + timer once the quiz loads.
    useEffect(() => {
        if (quiz && !started && quiz.questions.length > 0) {
            setQueue(quiz.questions.map((_, i) => i));
            if (quiz.mode === "TIMED" && quiz.timeLimitSeconds) {
                setSecondsLeft(quiz.timeLimitSeconds);
            }
            setStarted(true);
        }
    }, [quiz, started]);

    const doSubmit = () => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        const list: QuizAnswer[] = Object.entries(answersRef.current).map(
            ([qid, idx]) => ({
                questionId: Number(qid),
                selectedOptionIndex: idx,
            }),
        );
        submitQuiz.mutate(list);
    };

    // TIMED countdown.
    useEffect(() => {
        if (!quiz || quiz.mode !== "TIMED" || !started || result) return;
        if (secondsLeft <= 0) {
            doSubmit();
            return;
        }
        const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, quiz, started, result]);

    if (isLoading) return <div role="status" aria-live="polite" aria-label={t("quizzes.loading")}><Spinner label={t("quizzes.loading")} aria-hidden="true" /></div>;
    if (!quiz || !quiz.questions.length) {
        return (
            <div className={styles.empty}>
                <Title3>{t("quizzes.noQuestions")}</Title3>
                <Text>{t("quizzes.noQuestionsDescription")}</Text>
            </div>
        );
    }

    const mode: QuizMode = quiz.mode ?? "TIMED";
    const total = quiz.questions.length;
    const queueIdx = queue[pos];
    const currentQuestion = queueIdx === undefined ? null : quiz.questions[queueIdx];

    const handleSelect = (optionIndex: number) => {
        if (checked && mode !== "TIMED") return;
        if (!currentQuestion) return;
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    };

    const isCorrectSelection = (qid: number): boolean => {
        const sel = answers[qid];
        const q = quiz.questions.find((x) => x.id === qid);
        return q?.correctOptionIndex !== undefined && sel === q.correctOptionIndex;
    };

    const handleCheck = () => {
        if (!currentQuestion) return;
        const qid = currentQuestion.id;
        const correct = isCorrectSelection(qid);
        setChecked(true);
        if (!correct) {
            setWrongCounts((prev) => ({ ...prev, [qid]: (prev[qid] ?? 0) + 1 }));
        }
    };

    const handleNext = () => {
        if (!currentQuestion) return;
        const qid = currentQuestion.id;
        const correct = isCorrectSelection(qid);
        const nextPos = pos + 1;

        // Determine whether to re-queue a wrong answer.
        if (!correct && mode !== "TIMED") {
            const shouldRequeue =
                mode === "MASTERY"
                    ? (wrongCounts[qid] ?? 0) < MAX_MASTERY_ROUNDS
                    : !requeued.has(qid);
            if (shouldRequeue) {
                setQueue((prev) => [...prev, queue[pos]]);
                if (mode === "ADAPTIVE") {
                    setRequeued((prev) => new Set(prev).add(qid));
                }
            }
        }

        // ADAPTIVE early-finish: once enough attempted with high accuracy.
        if (mode === "ADAPTIVE") {
            const attempted = Object.keys(answers).length;
            const correctCount = quiz.questions.filter(
                (q) => isCorrectSelection(q.id),
            ).length;
            const need = Math.ceil(total / 2);
            if (attempted >= need && correctCount / attempted >= 0.8) {
                doSubmit();
                return;
            }
        }

        setChecked(false);
        if (nextPos >= queue.length) {
            doSubmit();
        } else {
            setPos(nextPos);
        }
    };

    const handleRetry = () => {
        submittedRef.current = false;
        setAnswers({});
        setQueue(quiz.questions.map((_, i) => i));
        setPos(0);
        setChecked(false);
        setWrongCounts({});
        setRequeued(new Set());
        if (mode === "TIMED" && quiz.timeLimitSeconds) {
            setSecondsLeft(quiz.timeLimitSeconds);
        }
        submitQuiz.reset();
    };

    const modeLabel =
        mode === "TIMED"
            ? t("quizzes.modeTimed")
            : mode === "MASTERY"
              ? t("quizzes.modeMastery")
              : t("quizzes.modeAdaptive");

    if (result) {
        const pct = Math.round(result.percentage);
        return (
            <Card className={styles.resultCard}>
                <Title3>{t("quizzes.complete")}</Title3>
                <Subtitle2>
                    {t("quizzes.score", {
                        score: result.score,
                        total: result.totalQuestions,
                        pct,
                    })}
                </Subtitle2>
                <Badge appearance="filled" color={result.passed ? "success" : "danger"}>
                    {result.passed ? t("quizzes.passed") : t("quizzes.tryAgain")}
                </Badge>
                <Caption1>{modeLabel}</Caption1>
                <div style={{ marginTop: tokens.spacingVerticalM, width: "100%" }}>
                    {result.details.map((d) => (
                        <div key={d.questionId} className={styles.detailRow}>
                            {d.correct ? (
                                <CheckmarkCircle24Regular
                                    style={{ color: tokens.colorPaletteGreenForeground1 }}
                                />
                            ) : (
                                <DismissCircle24Regular
                                    style={{ color: tokens.colorPaletteRedForeground1 }}
                                />
                            )}
                            <Text>{t("quizzes.questionLabel")} {d.questionId}</Text>
                        </div>
                    ))}
                </div>
                <Button
                    appearance="primary"
                    onClick={handleRetry}
                    style={{ marginTop: tokens.spacingVerticalM }}
                >
                    {t("quizzes.retry")}
                </Button>
            </Card>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    const selected = answers[currentQuestion.id];
    const canCheck = selected !== undefined && !checked;
    const canAdvance =
        mode === "TIMED"
            ? selected !== undefined
            : checked;
    const isLast = pos >= queue.length - 1;

    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");

    return (
        <div className={styles.container}>
            <div className={styles.metaRow}>
                <div className={styles.metaLeft}>
                    <Badge appearance="outline">{modeLabel}</Badge>
                    <Caption1>
                        {t("quizzes.questionOf", {
                            current: pos + 1,
                            total: queue.length,
                        })}
                    </Caption1>
                </div>
                {mode === "TIMED" && (
                    <Badge appearance="filled" color={secondsLeft <= 10 ? "danger" : "informative"}>
                        {mm}:{ss}
                    </Badge>
                )}
            </div>

            <Card className={styles.questionCard}>
                <Subtitle2>{currentQuestion.question}</Subtitle2>
                <div className={styles.options}>
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selected === idx;
                        const correctIdx = currentQuestion.correctOptionIndex;
                        const showAsCorrect =
                            checked && correctIdx !== undefined && idx === correctIdx;
                        const showAsWrong =
                            checked && isSelected && idx !== correctIdx;

                        let style: React.CSSProperties = {};
                        if (showAsCorrect) {
                            style = {
                                borderColor: tokens.colorPaletteGreenBorder1,
                                backgroundColor: tokens.colorPaletteGreenBackground2,
                            };
                        } else if (showAsWrong) {
                            style = {
                                borderColor: tokens.colorPaletteRedBorder1,
                                backgroundColor: tokens.colorPaletteRedBackground2,
                            };
                        }

                        return (
                            <Button
                                key={idx}
                                appearance={isSelected && !checked ? "primary" : "outline"}
                                className={styles.option}
                                onClick={() => handleSelect(idx)}
                                style={style}
                                disabled={checked && mode !== "TIMED"}
                            >
                                {option}
                            </Button>
                        );
                    })}
                </div>

                {checked && mode !== "TIMED" && (
                    <div
                        className={styles.feedback}
                        style={{
                            backgroundColor: isCorrectSelection(currentQuestion.id)
                                ? tokens.colorPaletteGreenBackground2
                                : tokens.colorPaletteRedBackground2,
                        }}
                    >
                        <Text weight="semibold">
                            {isCorrectSelection(currentQuestion.id)
                                ? t("quizzes.correct")
                                : t("quizzes.incorrect")}
                        </Text>
                        {currentQuestion.explanation && (
                            <Text>{currentQuestion.explanation}</Text>
                        )}
                    </div>
                )}

                {mode === "MASTERY" && !checked && (
                    <Caption1>{t("quizzes.masteryHint")}</Caption1>
                )}

                <div className={styles.actions}>
                    {mode !== "TIMED" && (
                        <Button
                            appearance="outline"
                            onClick={handleCheck}
                            disabled={!canCheck}
                        >
                            {t("quizzes.check")}
                        </Button>
                    )}
                    <Button
                        appearance="primary"
                        onClick={handleNext}
                        disabled={!canAdvance || submitQuiz.isPending}
                        /* B-ui-182: preserve accessible name while the
                           pending Spinner replaces the visible label. The
                           label is conditional (submit on last question,
                           next otherwise), so mirror the same condition. */
                        aria-label={
                            submitQuiz.isPending
                                ? isLast
                                    ? t("common.submit")
                                    : t("quizzes.next")
                                : undefined
                        }
                    >
                        {submitQuiz.isPending ? (
                            <Spinner size="tiny" />
                        ) : isLast ? (
                            t("common.submit")
                        ) : (
                            t("quizzes.next")
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
