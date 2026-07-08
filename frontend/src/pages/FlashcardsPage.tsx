import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Option, Spinner } from "@fluentui/react-components";
import { ArrowLeft24Regular, Sparkle24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useDecks } from "../hooks/useFlashcards";
import FlashcardDeck from "../components/FlashcardDeck";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import stateStyles from "@/components/States.module.css";
import styles from "./FlashcardsPage.module.css";

export default function FlashcardsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: decks, isLoading } = useDecks();
    const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();

    const deckOptions = decks?.map((d) => ({ value: String(d.id), label: d.name })) || [];

    return (
        <main className={styles.container}>
            <Seo
                title={`${t("flashcards.title")} — LernChih`}
                description={t("flashcards.description")}
                canonicalPath="/flashcards"
            />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <h1 className={styles.title}>{t("flashcards.title")}</h1>
            </div>

            <div className={styles.deckSelector}>
                <Dropdown
                    placeholder={t("flashcards.selectDeck")}
                    value={deckOptions.find((d) => d.value === selectedDeckId)?.label || ""}
                    selectedOptions={selectedDeckId ? [selectedDeckId] : []}
                    onOptionSelect={(_, data) => setSelectedDeckId(data.optionValue)}
                    disabled={isLoading}
                >
                    {deckOptions.map((d) => (
                        <Option key={d.value} value={d.value}>
                            {d.label}
                        </Option>
                    ))}
                </Dropdown>
            </div>

            {isLoading && (
                <div className={stateStyles.loading} role="status" aria-live="polite">
                    <Spinner />
                    <p className={stateStyles.loadingLabel}>{t("flashcards.loadingDecks")}</p>
                </div>
            )}

            {!isLoading && !selectedDeckId && (!decks || decks.length === 0) && (
                <EmptyState
                    icon={<Sparkle24Regular />}
                    title={t("empty.flashcardsTitle")}
                    description={t("empty.flashcardsDescription")}
                />
            )}

            {!isLoading &&
                !selectedDeckId &&
                decks &&
                decks.length > 0 &&
                decks.map((deck) => (
                    <Card
                        key={deck.id}
                        interactive
                        padding="md"
                        className={styles.deckCard}
                        onClick={() => setSelectedDeckId(String(deck.id))}
                    >
                        <h2 className={styles.deckTitle}>{deck.name}</h2>
                        <p className={styles.deckText}>
                            {t("flashcards.cardsDue", {
                                cards: deck.cardCount,
                                due: deck.dueCount ?? 0,
                            })}
                        </p>
                    </Card>
                ))}

            {selectedDeckId && <FlashcardDeck deckId={selectedDeckId} />}
        </main>
    );
}
