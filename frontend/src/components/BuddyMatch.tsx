import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Spinner, Avatar } from "@fluentui/react-components";
import {
    PersonAdd24Regular,
    Dismiss24Regular,
    PeopleCommunity24Regular,
} from "@fluentui/react-icons";
import {
    useBuddySuggestions,
    useDismissSuggestion,
    useMarkConnected,
} from "@/hooks/useMatching";
import { useSendFriendRequest } from "@/hooks/useFriends";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./BuddyMatch.module.css";

/**
 * Study-buddy matching card (F39). Surfaces other learners ranked by overlap
 * of shared subjects. Pressing "Connect" sends a friend request via the F38
 * friendship endpoint and marks the suggestion as CONNECTED locally so it
 * disappears from the list.
 *
 * Shown on the dashboard.
 */
export function BuddyMatch() {
    const { t } = useTranslation();
    const suggestionsQuery = useBuddySuggestions();
    const dismiss = useDismissSuggestion();
    const markConnected = useMarkConnected();
    const sendFriendRequest = useSendFriendRequest();

    const suggestions = suggestionsQuery.data ?? [];

    if (suggestionsQuery.isLoading) {
        return (
            <Card padding="lg" className={styles.section}>
                <Spinner size="tiny" />
            </Card>
        );
    }

    return (
        <Card padding="lg" className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{t("buddyMatch.title")}</h2>
                    <p className={styles.subtitle}>{t("buddyMatch.subtitle")}</p>
                </div>
            </div>

            {suggestions.length === 0 ? (
                <div className={styles.empty}>
                    <PeopleCommunity24Regular className={styles.emptyIcon} />
                    <p className={styles.emptyText}>{t("buddyMatch.empty")}</p>
                </div>
            ) : (
                <ul className={styles.list}>
                    {suggestions.map((s) => (
                        <li key={s.matchId} className={styles.item}>
                            <div className={styles.userInfo}>
                                <Link
                                    to={`/profile/${s.buddyId}`}
                                    className={styles.userInfo}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                >
                                    <Avatar name={s.buddyName || "?"} size={32} />
                                    <span className={styles.userName}>
                                        {s.buddyName || t("common.unknown")}
                                    </span>
                                </Link>
                            </div>
                            <div className={styles.scoreBlock}>
                                <span className={styles.score}>{s.matchScore}%</span>
                                <Badge variant="neutral" size="small">
                                    {t("buddyMatch.sharedSubjects", {
                                        count: s.sharedSubjectCount,
                                    })}
                                </Badge>
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    size="small"
                                    icon={<PersonAdd24Regular />}
                                    onClick={() => {
                                        sendFriendRequest.mutate(s.buddyId, {
                                            onSuccess: () =>
                                                markConnected.mutate(s.buddyId),
                                        });
                                    }}
                                    disabled={
                                        sendFriendRequest.isPending ||
                                        markConnected.isPending
                                    }
                                >
                                    {t("buddyMatch.connect")}
                                </Button>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<Dismiss24Regular />}
                                    aria-label={t("buddyMatch.dismiss")}
                                    onClick={() => dismiss.mutate(s.matchId)}
                                    disabled={dismiss.isPending}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

export default BuddyMatch;
