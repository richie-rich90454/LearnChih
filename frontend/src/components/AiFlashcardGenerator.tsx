import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Spinner,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import { Sparkle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    generateAiFlashcards,
    saveAiFlashcards,
    type GeneratedFlashcard,
} from "../api/aiFlashcards";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import styles from "./AiFlashcardGenerator.module.css";

type Status =
    | "idle"
    | "generating"
    | "ready"
    | "saving"
    | "saved"
    | "error"
    | "empty";

/**
 * AI flashcard generator (F4). Renders a "Generate Flashcards with AI" action
 * on the resource detail page. Generation calls a mock backend service that
 * derives cloze-deletion cards from the resource's content; the user can then
 * name a deck and persist the cards for spaced-repetition review.
 */
export default function AiFlashcardGenerator({
    resourceId,
}: {
    resourceId: number;
}) {
    const { t } = useTranslation();
    const [cards, setCards] = useState<GeneratedFlashcard[]>([]);
    const [deckName, setDeckName] = useState("");
    const [status, setStatus] = useState<Status>("idle");

    const generateMutation = useMutation({
        mutationFn: () => generateAiFlashcards(resourceId).then((r) => r.data),
        onMutate: () => setStatus("generating"),
        onSuccess: (data) => {
            if (!data.cards || data.cards.length === 0) {
                setStatus("empty");
            } else {
                setCards(data.cards);
                setStatus("ready");
            }
        },
        onError: () => setStatus("error"),
    });

    const saveMutation = useMutation({
        mutationFn: () =>
            saveAiFlashcards(resourceId, deckName, cards).then((r) => r.data),
        onMutate: () => setStatus("saving"),
        onSuccess: () => setStatus("saved"),
        onError: () => setStatus("error"),
    });

    const handleGenerate = () => {
        setStatus("generating");
        generateMutation.mutate();
    };

    const handleReset = () => {
        setCards([]);
        setDeckName("");
        setStatus("idle");
    };

    const showResults =
        (status === "ready" || status === "saving" || status === "saved") &&
        cards.length > 0;

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>{t("aiFlashcards.title")}</h2>
                    <p className={styles.description}>
                        {t("aiFlashcards.description")}
                    </p>
                </div>
                <Sparkle24Regular className={styles.icon} aria-hidden />
            </div>

            {status === "error" && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("aiFlashcards.error")}</MessageBarBody>
                </MessageBar>
            )}

            {status === "empty" && (
                <MessageBar intent="info">
                    <MessageBarBody>{t("aiFlashcards.empty")}</MessageBarBody>
                </MessageBar>
            )}

            {status === "generating" && (
                <div className={styles.loading}>
                    <Spinner size="tiny" />
                    <span>{t("aiFlashcards.generating")}</span>
                </div>
            )}

            {showResults && (
                <>
                    {status === "saved" && (
                        <MessageBar intent="success">
                            <MessageBarBody>
                                {t("aiFlashcards.saved")}
                            </MessageBarBody>
                        </MessageBar>
                    )}

                    <ul className={styles.cardList}>
                        {cards.map((c, i) => (
                            <li key={i} className={styles.flashcard}>
                                <div className={styles.flashcardSide}>
                                    <span className={styles.sideLabel}>
                                        {t("aiFlashcards.front")}
                                    </span>
                                    <span className={styles.sideText}>
                                        {c.front}
                                    </span>
                                </div>
                                <div className={styles.flashcardSide}>
                                    <span className={styles.sideLabel}>
                                        {t("aiFlashcards.back")}
                                    </span>
                                    <span className={styles.sideText}>
                                        {c.back}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {status !== "saved" ? (
                        <div className={styles.saveRow}>
                            <Input
                                value={deckName}
                                onChange={(_, data) => setDeckName(data.value)}
                                placeholder={t("aiFlashcards.deckName")}
                                wrapperClassName={styles.deckInput}
                            />
                            <Button
                                variant="primary"
                                onClick={() => saveMutation.mutate()}
                                loading={status === "saving"}
                                disabled={status === "saving"}
                            >
                                {t("aiFlashcards.save")}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="subtle"
                            icon={<Sparkle24Regular />}
                            onClick={handleReset}
                        >
                            {t("aiFlashcards.button")}
                        </Button>
                    )}
                </>
            )}

            {status === "idle" && (
                <Button
                    variant="outline"
                    icon={<Sparkle24Regular />}
                    onClick={handleGenerate}
                >
                    {t("aiFlashcards.button")}
                </Button>
            )}
        </Card>
    );
}
