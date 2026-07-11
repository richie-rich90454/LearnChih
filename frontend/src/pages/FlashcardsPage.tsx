import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Option, Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { ArrowLeft24Regular, Sparkle24Regular, Share24Regular } from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDecks } from "../hooks/useFlashcards";
import FlashcardDeck from "../components/FlashcardDeck";
import ShareDeckDialog from "../components/ShareDeckDialog";
import { getSharedWithMe, revokeSharedDeck, type SharedDeck } from "../api/sharedDecks";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import stateStyles from "@/components/States.module.css";
import styles from "./FlashcardsPage.module.css";

export default function FlashcardsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: decks, isLoading } = useDecks();
    const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();

    const sharedWithMeQuery = useQuery<SharedDeck[]>({
        queryKey: ["sharedDecks", "shared-with-me"],
        queryFn: () => getSharedWithMe().then((r) => r.data),
    });

    const revokeMutation = useMutation({
        mutationFn: (id: number) => revokeSharedDeck(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["sharedDecks", "shared-with-me"],
            });
        },
    });

    const deckOptions = decks?.map((d) => ({ value: String(d.id), label: d.name })) || [];

    const handleOpenShared = (deckId: number) => {
        setSelectedDeckId(String(deckId));
    };

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
                    >
                        <div className={styles.deckCardRow}>
                            <button
                                type="button"
                                className={styles.deckCardButton}
                                onClick={() => setSelectedDeckId(String(deck.id))}
                            >
                                <h2 className={styles.deckTitle}>{deck.name}</h2>
                                <p className={styles.deckText}>
                                    {t("flashcards.cardsDue", {
                                        cards: deck.cardCount,
                                        due: deck.dueCount ?? 0,
                                    })}
                                </p>
                            </button>
                            <ShareDeckDialog deckId={deck.id} deckName={deck.name} />
                        </div>
                    </Card>
                ))}

            {selectedDeckId && <FlashcardDeck deckId={selectedDeckId} />}

            {/* Shared with me (F15) */}
            {!selectedDeckId && (
                <section className={styles.sharedSection} aria-label={t("shareDeck.sharedWithMeTitle")}>
                    <h2 className={styles.sectionTitle}>
                        <Share24Regular aria-hidden />
                        {t("shareDeck.sharedWithMeTitle")}
                    </h2>
                    {sharedWithMeQuery.isLoading && (
                        <div className={stateStyles.loading} role="status" aria-live="polite">
                            <Spinner size="tiny" />
                            <p className={stateStyles.loadingLabel}>{t("shareDeck.loading")}</p>
                        </div>
                    )}
                    {sharedWithMeQuery.isError && (
                        <MessageBar intent="error">
                            <MessageBarBody>{t("shareDeck.errorGeneric")}</MessageBarBody>
                        </MessageBar>
                    )}
                    {!sharedWithMeQuery.isLoading &&
                        !sharedWithMeQuery.isError &&
                        (sharedWithMeQuery.data?.length ?? 0) === 0 && (
                            <p className={styles.sharedEmpty}>
                                {t("shareDeck.sharedWithMeEmpty")}
                            </p>
                        )}
                    {!sharedWithMeQuery.isLoading &&
                        !sharedWithMeQuery.isError &&
                        sharedWithMeQuery.data?.map((share) => (
                            <Card key={share.id} padding="md" className={styles.sharedCard}>
                                <div className={styles.deckCardRow}>
                                    <button
                                        type="button"
                                        className={styles.deckCardButton}
                                        onClick={() => handleOpenShared(share.deckId)}
                                    >
                                        <h3 className={styles.deckTitle}>
                                            {share.deckName ?? t("common.unknown")}
                                        </h3>
                                        <p className={styles.deckText}>
                                            {t("shareDeck.sharedBy", {
                                                name: share.sharedByName ?? t("common.unknown"),
                                            })}
                                        </p>
                                    </button>
                                    <div className={styles.sharedActions}>
                                        <Badge
                                            variant={share.permission === "EDIT" ? "accent" : "neutral"}
                                            size="small"
                                        >
                                            {share.permission === "EDIT"
                                                ? t("shareDeck.permissionBadgeEdit")
                                                : t("shareDeck.permissionBadgeView")}
                                        </Badge>
                                        <Button
                                            variant="subtle"
                                            size="small"
                                            onClick={() => handleOpenShared(share.deckId)}
                                        >
                                            {t("shareDeck.open")}
                                        </Button>
                                        <Button
                                            variant="subtle"
                                            size="small"
                                            onClick={() => revokeMutation.mutate(share.id)}
                                            disabled={revokeMutation.isPending}
                                        >
                                            {t("shareDeck.revoke")}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                </section>
            )}
        </main>
    );
}
