import { useNavigate } from "react-router-dom";
import { Checkmark24Regular, ArrowLeft24Regular, AlertOff24Regular } from "@fluentui/react-icons";
import { Spinner } from "@fluentui/react-components";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/api/notifications";
import { useNotificationStore } from "@/store/notificationStore";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import stateStyles from "@/components/States.module.css";
import styles from "./NotificationsPage.module.css";

function cx(...parts: Array<string | false | undefined | null>): string {
    return parts.filter(Boolean).join(" ");
}

export default function NotificationsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    const {
        data: notificationsData,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications().then((r) => r.data),
    });

    useEffect(() => {
        if (notificationsData) {
            setNotifications(notificationsData);
        }
    }, [notificationsData, setNotifications]);

    const markReadMutation = useMutation({
        mutationFn: (id: number) => markNotificationRead(id),
        onSuccess: (_, id) => {
            markAsRead(id);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllMutation = useMutation({
        mutationFn: () => markAllNotificationsRead(),
        onSuccess: () => {
            markAllAsRead();
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const handleClick = (id: number, link?: string) => {
        markReadMutation.mutate(id);
        if (link) navigate(link);
    };

    return (
        <div className={styles.container}>
            <Seo
                title="Notifications — LernChih"
                canonicalPath="/notifications"
                robots="noindex, follow"
            />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className={styles.title}>Notifications</h1>
                {notifications.some((n) => !n.read) && (
                    <Button
                        variant="outline"
                        icon={<Checkmark24Regular />}
                        onClick={() => markAllMutation.mutate()}
                        disabled={markAllMutation.isPending}
                    >
                        Mark all read
                    </Button>
                )}
            </div>

            {isLoading && notifications.length === 0 && (
                <div className={stateStyles.loading} role="status" aria-live="polite">
                    <Spinner />
                    <p className={stateStyles.loadingLabel}>Loading notifications…</p>
                </div>
            )}
            {isError && (
                <ErrorState
                    title={t("error.notificationsTitle")}
                    description={t("error.notificationsDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}
            {!isLoading && !isError && notifications.length === 0 && (
                <EmptyState
                    icon={<AlertOff24Regular />}
                    title={t("empty.notificationsTitle")}
                    description={t("empty.notificationsDescription")}
                />
            )}

            {notifications.map((n) => (
                <Card
                    key={n.id}
                    interactive
                    padding="md"
                    className={cx(styles.notificationCard, !n.read && styles.unread)}
                    onClick={() => handleClick(n.id, n.link)}
                >
                    <p className={cx(styles.notificationTitle, !n.read && styles.notificationTitleUnread)}>
                        {n.title}
                    </p>
                    <p className={styles.notificationMessage}>{n.message}</p>
                    <span className={styles.notificationTime}>
                        {new Date(n.createdAt).toLocaleString()}
                    </span>
                </Card>
            ))}
        </div>
    );
}
