import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Spinner, Avatar, MessageBar, MessageBarBody } from "@fluentui/react-components";
import {
    PersonAdd24Regular,
    Dismiss24Regular,
    PeopleCommunity24Regular,
    Sparkle24Regular,
} from "@fluentui/react-icons";
import {
    useBuddySuggestions,
    useDismissSuggestion,
    useMarkConnected,
} from "@/hooks/useMatching";
import { useSendFriendRequest } from "@/hooks/useFriends";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./StudyBuddyPage.module.css";

/**
 * Study-buddy matching page (F39). Surfaces ranked buddy suggestions with a
 * compatibility score. "Accept" sends a friend request and marks the match as
 * connected; "Decline" dismisses the suggestion so it won't reappear.
 */
export default function StudyBuddyPage() {
    const { t } = useTranslation();
    const suggestionsQuery = useBuddySuggestions();
    const dismiss = useDismissSuggestion();
    const markConnected = useMarkConnected();
    const sendFriendRequest = useSendFriendRequest();

    const suggestions = suggestionsQuery.data ?? [];

    const handleAccept = (buddyId: number, matchId: number) => {
        sendFriendRequest.mutate(buddyId, {
            onSuccess: () => markConnected.mutate(buddyId),
        });
        void matchId;
    };

    const handleDecline = (matchId: number) => {
        dismiss.mutate(matchId);
    };

    const busy = sendFriendRequest.isPending || markConnected.isPending || dismiss.isPending;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("studyBuddy.title")} — LernChih`}
                description={t("studyBuddy.subtitle")}
                canonicalPath="/study-buddy"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon} aria-hidden="true">
                        <PeopleCommunity24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("studyBuddy.title")}</h1>
                        <p className={styles.subtitle}>{t("studyBuddy.subtitle")}</p>
                    </div>
                </div>
            </header>

            {suggestionsQuery.isError && (
                <ErrorState
                    icon={<PeopleCommunity24Regular />}
                    title={t("studyBuddy.errorTitle")}
                    description={t("studyBuddy.errorDescription")}
                    onRetry={() => suggestionsQuery.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}

            {suggestionsQuery.isLoading && <Spinner label={t("common.loading")} />}

            {!suggestionsQuery.isLoading && !suggestionsQuery.isError && suggestions.length === 0 && (
                <EmptyState
                    icon={<PeopleCommunity24Regular />}
                    title={t("studyBuddy.emptyTitle")}
                    description={t("studyBuddy.emptyDescription")}
                />
            )}

            {suggestions.length > 0 && (
                <ul className={styles.list} aria-label={t("studyBuddy.title")}>
                    {suggestions.map((s) => (
                        <li key={s.matchId}>
                            <Card padding="lg" className={styles.matchCard}>
                                <div className={styles.matchTop}>
                                    <Link
                                        to={`/profile/${s.buddyId}`}
                                        className={styles.identity}
                                    >
                                        <Avatar name={s.buddyName || "?"} size={40} />
                                        <div className={styles.identityText}>
                                            <span className={styles.userName}>
                                                {s.buddyName || t("common.unknown")}
                                            </span>
                                            <Badge variant="neutral" size="small">
                                                {t("studyBuddy.sharedSubjects", {
                                                    count: s.sharedSubjectCount,
                                                })}
                                            </Badge>
                                        </div>
                                    </Link>
                                    <div className={styles.scoreBlock}>
                                        <Sparkle24Regular className={styles.scoreIcon} aria-hidden="true" />
                                        <span className={styles.score}>{s.matchScore}%</span>
                                        <span className={styles.scoreLabel}>
                                            {t("studyBuddy.compatibility")}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.scoreBar} aria-hidden="true">
                                    <div
                                        className={styles.scoreFill}
                                        style={{ width: `${Math.max(4, Math.min(100, s.matchScore))}%` }}
                                    />
                                </div>

                                <div className={styles.actions}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        icon={<PersonAdd24Regular />}
                                        onClick={() => handleAccept(s.buddyId, s.matchId)}
                                        disabled={busy}
                                        loading={sendFriendRequest.isPending || markConnected.isPending}
                                    >
                                        {t("studyBuddy.accept")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Dismiss24Regular />}
                                        onClick={() => handleDecline(s.matchId)}
                                        disabled={busy}
                                    >
                                        {t("studyBuddy.decline")}
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            {sendFriendRequest.isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("studyBuddy.acceptError")}</MessageBarBody>
                </MessageBar>
            )}
        </div>
    );
}
