import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Spinner, Avatar } from "@fluentui/react-components";
import { PersonAdd24Regular, Checkmark24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import {
    useFriends,
    useIncomingRequests,
    useSentRequests,
    useAcceptFriendRequest,
    useDeclineFriendRequest,
    useUnfriend,
} from "@/hooks/useFriends";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./FriendsList.module.css";

/**
 * Friends / study-buddies list (F38). Shown on the owner's own profile.
 * Displays accepted friends, incoming requests, and sent requests in
 * separate sections with accept / decline / unfriend actions.
 */
export function FriendsList() {
    const { t } = useTranslation();
    const friendsQuery = useFriends();
    const incomingQuery = useIncomingRequests();
    const sentQuery = useSentRequests();
    const accept = useAcceptFriendRequest();
    const decline = useDeclineFriendRequest();
    const unfriend = useUnfriend();

    const friends = friendsQuery.data ?? [];
    const incoming = incomingQuery.data ?? [];
    const sent = sentQuery.data ?? [];

    if (friendsQuery.isLoading) {
        return (
            <Card padding="lg" className={styles.section}>
                <Spinner size="tiny" />
            </Card>
        );
    }

    return (
        <Card padding="lg" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("friends.title")}</h2>
            </div>

            {/* Accepted friends */}
            {friends.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>
                        {t("friends.friendsCount", { count: friends.length })}
                    </h3>
                    <ul className={styles.list}>
                        {friends.map((f) => (
                            <li key={f.id} className={styles.item}>
                                <Link
                                    to={`/profile/${f.userId}`}
                                    className={styles.userLink}
                                >
                                    <Avatar name={f.name || "?"} size={32} />
                                    <span className={styles.userName}>
                                        {f.name || t("common.unknown")}
                                    </span>
                                </Link>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<Dismiss24Regular />}
                                    aria-label={t("friends.unfriend")}
                                    onClick={() => unfriend.mutate(f.id)}
                                    disabled={unfriend.isPending}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Incoming requests */}
            {incoming.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>
                        {t("friends.incomingCount", { count: incoming.length })}
                    </h3>
                    <ul className={styles.list}>
                        {incoming.map((f) => (
                            <li key={f.id} className={styles.item}>
                                <Link
                                    to={`/profile/${f.userId}`}
                                    className={styles.userLink}
                                >
                                    <Avatar name={f.name || "?"} size={32} />
                                    <span className={styles.userName}>
                                        {f.name || t("common.unknown")}
                                    </span>
                                </Link>
                                <div className={styles.actions}>
                                    <Button
                                        variant="primary"
                                        size="small"
                                        icon={<Checkmark24Regular />}
                                        onClick={() => accept.mutate(f.id)}
                                        disabled={accept.isPending}
                                    >
                                        {t("friends.accept")}
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Dismiss24Regular />}
                                        aria-label={t("friends.decline")}
                                        onClick={() => decline.mutate(f.id)}
                                        disabled={decline.isPending}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Sent requests */}
            {sent.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>
                        {t("friends.sentCount", { count: sent.length })}
                    </h3>
                    <ul className={styles.list}>
                        {sent.map((f) => (
                            <li key={f.id} className={styles.item}>
                                <Link
                                    to={`/profile/${f.userId}`}
                                    className={styles.userLink}
                                >
                                    <Avatar name={f.name || "?"} size={32} />
                                    <span className={styles.userName}>
                                        {f.name || t("common.unknown")}
                                    </span>
                                </Link>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    onClick={() => decline.mutate(f.id)}
                                    disabled={decline.isPending}
                                >
                                    {t("friends.cancel")}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty state */}
            {friends.length === 0 &&
                incoming.length === 0 &&
                sent.length === 0 && (
                    <div className={styles.empty}>
                        <PersonAdd24Regular className={styles.emptyIcon} />
                        <p className={styles.emptyText}>
                            {t("friends.empty")}
                        </p>
                    </div>
                )}
        </Card>
    );
}

export default FriendsList;
