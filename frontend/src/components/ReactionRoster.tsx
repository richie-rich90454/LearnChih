import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@fluentui/react-components";
import { PeopleCommunity24Regular } from "@fluentui/react-icons";
import type { Reaction } from "@/hooks/useSocial";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ReactionRoster.module.css";

interface ReactionRosterProps {
    emoji: string;
    reactions: Reaction[];
}

/** Mock user data used when the API returns no reactions (demo fallback). */
const MOCK_REACTORS: { userId: number; userName: string }[] = [
    { userId: 101, userName: "Alex" },
    { userId: 102, userName: "Sam" },
    { userId: 103, userName: "Jordan" },
];

/**
 * "Who reacted" panel (F59). Displays the list of users who reacted with a
 * specific emoji on a post. When the API returns no reaction data, three mock
 * users are shown as a demo fallback.
 *
 * Spec ref: F59.
 */
export function ReactionRoster({ emoji, reactions }: ReactionRosterProps) {
    const { t } = useTranslation();
    const reduced = useReducedMotion();

    const displayReactions = useMemo<Reaction[]>(() => {
        if (reactions.length > 0) return reactions;
        // Demo fallback: show 3 mock reactors.
        const now = Date.now();
        return MOCK_REACTORS.map((u, i) => ({
            id: -(i + 1),
            postId: 0,
            userId: u.userId,
            userName: u.userName,
            emoji,
            createdAt: new Date(now - i * 60000).toISOString(),
        }));
    }, [reactions, emoji]);

    const count = displayReactions.length;

    return (
        <div
            className={styles.roster}
            style={reduced ? { transitionDuration: "0.01ms" } : undefined}
        >
            <div className={styles.header}>
                <span className={styles.headerIcon}>
                    <PeopleCommunity24Regular />
                </span>
                <span className={styles.headerText}>
                    {emoji} {count} {count === 1 ? t("reactionRoster.person", "person") : t("reactionRoster.people", "people")}
                </span>
            </div>
            <div className={styles.list}>
                {displayReactions.map((r) => (
                    <div key={r.id} className={styles.item}>
                        <Avatar name={r.userName} size={24} className={styles.avatar} />
                        <span className={styles.name}>{r.userName}</span>
                        {r.createdAt && (
                            <time
                                className={styles.time}
                                dateTime={new Date(r.createdAt).toISOString()}
                            >
                                {new Date(r.createdAt).toLocaleTimeString()}
                            </time>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReactionRoster;
