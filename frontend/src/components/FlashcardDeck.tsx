import { useState } from "react";
import {
    makeStyles,
    tokens,
    Card,
    Button,
    Text,
    Title3,
    Caption1,
    Spinner,
} from "@fluentui/react-components";
import {
    ArrowLeft24Regular,
    ArrowRight24Regular,
    ArrowRotateClockwise24Regular,
} from "@fluentui/react-icons";
import { useStudyDeck, useRateCard, type CardRating, type Flashcard } from "../hooks/useFlashcards";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        alignItems: "center",
        maxWidth: "600px",
        margin: "0 auto",
    },
    card: {
        width: "100%",
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: tokens.spacingHorizontalXL,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        textAlign: "center",
    },
    flipped: {
        backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    controls: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "center",
    },
    ratingRow: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    empty: {
        textAlign: "center",
        color: tokens.colorNeutralForeground3,
    },
});

interface FlashcardDeckProps {
    deckId: string | number;
}

const RATINGS: { value: CardRating; label: string }[] = [
    { value: "AGAIN", label: "Again" },
    { value: "HARD", label: "Hard" },
    { value: "GOOD", label: "Good" },
    { value: "EASY", label: "Easy" },
];

export default function FlashcardDeck({ deckId }: FlashcardDeckProps) {
    const styles = useStyles();
    const { data: session, isLoading } = useStudyDeck(deckId);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const cards: Flashcard[] = session?.cards || [];
    const currentCard = cards[index];
    const rateCard = useRateCard(currentCard?.id);

    const handleNext = () => {
        setFlipped(false);
        setIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        setFlipped(false);
        setIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const handleRate = (rating: CardRating) => {
        if (!currentCard) return;
        rateCard.mutate(rating, {
            onSuccess: () => {
                handleNext();
            },
        });
    };

    if (isLoading) return <div role="status" aria-live="polite" aria-label="Loading flashcards..."><Spinner label="Loading flashcards..." /></div>;

    if (!cards.length) {
        return (
            <div className={styles.empty}>
                <Title3>No cards due</Title3>
                <Text>Great job — you&apos;re all caught up with this deck.</Text>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Caption1>
                Card {index + 1} of {cards.length}
            </Caption1>

            <Card
                className={`${styles.card} ${flipped ? styles.flipped : ""}`}
                onClick={() => setFlipped((f) => !f)}
                role="button"
                aria-label={flipped ? "Flashcard back" : "Flashcard front"}
            >
                <Title3>{flipped ? currentCard.back : currentCard.front}</Title3>
                <Caption1
                    style={{
                        marginTop: tokens.spacingVerticalM,
                        color: tokens.colorNeutralForeground3,
                    }}
                >
                    {flipped ? "Back — click to see front" : "Front — click to flip"}
                </Caption1>
            </Card>

            <div className={styles.controls}>
                <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={handlePrev}>
                    Prev
                </Button>
                <Button
                    appearance="subtle"
                    icon={<ArrowRotateClockwise24Regular />}
                    onClick={() => setFlipped((f) => !f)}
                >
                    Flip
                </Button>
                <Button appearance="subtle" icon={<ArrowRight24Regular />} onClick={handleNext}>
                    Skip
                </Button>
            </div>

            {flipped && (
                <div className={styles.ratingRow}>
                    {RATINGS.map((r) => (
                        <Button
                            key={r.value}
                            appearance={r.value === "AGAIN" ? "outline" : "primary"}
                            onClick={() => handleRate(r.value)}
                            disabled={rateCard.isPending}
                        >
                            {r.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
