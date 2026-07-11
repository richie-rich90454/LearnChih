import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Option, Spinner } from "@fluentui/react-components";
import { ArrowLeft24Regular, QuestionCircle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useQuizzes } from "../hooks/useQuizzes";
import QuizWidget from "../components/QuizWidget";
import QuizAnalyticsPanel from "../components/QuizAnalyticsPanel";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import stateStyles from "@/components/States.module.css";
import styles from "./QuizPage.module.css";

export default function QuizPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: quizzes, isLoading } = useQuizzes();
    const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();

    const quizOptions = quizzes?.map((q) => ({ value: String(q.id), label: q.title })) || [];

    return (
        <main className={styles.container}>
            <Seo
                title={`${t("quizzes.title")} — LernChih`}
                description={t("quizzes.description")}
                canonicalPath="/quizzes"
            />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <h1 className={styles.title}>{t("quizzes.title")}</h1>
            </div>

            <Dropdown
                placeholder={t("quizzes.selectQuiz")}
                value={quizOptions.find((q) => q.value === selectedQuizId)?.label || ""}
                selectedOptions={selectedQuizId ? [selectedQuizId] : []}
                onOptionSelect={(_, data) => setSelectedQuizId(data.optionValue)}
                disabled={isLoading}
            >
                {quizOptions.map((q) => (
                    <Option key={q.value} value={q.value}>
                        {q.label}
                    </Option>
                ))}
            </Dropdown>

            {isLoading && (
                <div className={stateStyles.loading} role="status" aria-live="polite">
                    <Spinner />
                    <p className={stateStyles.loadingLabel}>{t("quizzes.loadingQuizzes")}</p>
                </div>
            )}

            {!isLoading && !selectedQuizId && (!quizzes || quizzes.length === 0) && (
                <EmptyState
                    icon={<QuestionCircle24Regular />}
                    title={t("empty.quizzesTitle")}
                    description={t("empty.quizzesDescription")}
                />
            )}

            {!isLoading &&
                !selectedQuizId &&
                quizzes &&
                quizzes.length > 0 &&
                quizzes.map((quiz) => (
                    <Card
                        key={quiz.id}
                        interactive
                        padding="md"
                        className={styles.quizCard}
                        onClick={() => setSelectedQuizId(String(quiz.id))}
                    >
                        <h2 className={styles.quizTitle}>{quiz.title}</h2>
                        {quiz.description && <p className={styles.quizText}>{quiz.description}</p>}
                        <p className={styles.quizText}>
                            {t("quizzes.questionCount", { count: quiz.questions.length })}
                        </p>
                    </Card>
                ))}

            {selectedQuizId && (
                <>
                    <QuizWidget quizId={selectedQuizId} />
                    <QuizAnalyticsPanel quizId={selectedQuizId} />
                </>
            )}
        </main>
    );
}
