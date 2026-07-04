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
import { useDecks } from "../hooks/useFlashcards";
import FlashcardDeck from "../components/FlashcardDeck";
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
    deckSelector: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "center",
    },
    deckCard: {
        padding: tokens.spacingHorizontalL,
        cursor: "pointer",
    },
});

export default function FlashcardsPage() {
    const styles = useStyles();
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
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <Title2 as="h1">{t("flashcards.title")}</Title2>
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

            {isLoading && <Spinner label={t("flashcards.loadingDecks")} />}

            {!isLoading &&
                !selectedDeckId &&
                decks?.map((deck) => (
                    <Card
                        key={deck.id}
                        className={styles.deckCard}
                        onClick={() => setSelectedDeckId(String(deck.id))}
                    >
                        <Text weight="semibold">{deck.name}</Text>
                        <Text style={{ color: "var(--colorNeutralForeground3)" }}>
                            {t("flashcards.cardsDue", {
                                cards: deck.cardCount,
                                due: deck.dueCount ?? 0,
                            })}
                        </Text>
                    </Card>
                ))}

            {selectedDeckId && <FlashcardDeck deckId={selectedDeckId} />}
        </main>
    );
}
