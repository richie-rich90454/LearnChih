import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Title2,
    Button,
    Card,
    Text,
    Spinner,
    Dropdown,
    Option,
} from "@fluentui/react-components";
import { ArrowLeft24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useQuizzes } from "../hooks/useQuizzes";
import QuizWidget from "../components/QuizWidget";
import Seo from "../components/Seo";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "800px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    quizCard: {
        padding: tokens.spacingHorizontalL,
        cursor: "pointer",
    },
});

export default function QuizPage() {
    const styles = useStyles();
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
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <Title2 as="h1">{t("quizzes.title")}</Title2>
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

            {isLoading && <Spinner label={t("quizzes.loadingQuizzes")} />}

            {!isLoading &&
                !selectedQuizId &&
                quizzes?.map((quiz) => (
                    <Card
                        key={quiz.id}
                        className={styles.quizCard}
                        onClick={() => setSelectedQuizId(String(quiz.id))}
                    >
                        <Text weight="semibold">{quiz.title}</Text>
                        {quiz.description && (
                            <Text style={{ color: "var(--colorNeutralForeground3)" }}>
                                {quiz.description}
                            </Text>
                        )}
                        <Text style={{ color: "var(--colorNeutralForeground3)" }}>
                            {t("quizzes.questionCount", { count: quiz.questions.length })}
                        </Text>
                    </Card>
                ))}

            {selectedQuizId && <QuizWidget quizId={selectedQuizId} />}
        </main>
    );
}
