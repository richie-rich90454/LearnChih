import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverSurface,
    MenuList,
    MenuItem,
    Text,
    Caption1,
    Spinner,
} from "@fluentui/react-components";
import { Alert24Regular, Checkmark24Regular, Clock24Regular } from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../api/notifications";
import { useNotificationStore, type AppNotification } from "../store/notificationStore";
import { NotificationGroupSection } from "./NotificationGroupSection";
import { SnoozeButton } from "./SnoozeButton";
import styles from "./NotificationBell.module.css";

const GROUP_KEYS = ["mentions", "reactions", "replies", "system"] as const;
type GroupKey = (typeof GROUP_KEYS)[number];

/** Infers a notification group from its title + message text. */
function categorize(n: AppNotification): GroupKey {
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (text.includes("@") || text.includes("mention")) return "mentions";
    if (text.includes("react") || text.includes("emoji")) return "reactions";
    if (text.includes("reply") || text.includes("replied") || text.includes("comment")) {
        return "replies";
    }
    return "system";
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export default function NotificationBell() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } =
        useNotificationStore();

    const { data: notificationsData, isLoading } = useQuery({
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

    useEffect(() => {
        if (!open) return;
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [open, queryClient]);

    const handleItemClick = (id: number, link?: string) => {
        markReadMutation.mutate(id);
        setOpen(false);
        if (link) navigate(link);
    };

    // Group notifications by inferred type, preserving GROUP_KEYS order.
    const grouped = useMemo(() => {
        const map: Record<GroupKey, AppNotification[]> = {
            mentions: [],
            reactions: [],
            replies: [],
            system: [],
        };
        for (const n of notifications) {
            map[categorize(n)].push(n);
        }
        return map;
    }, [notifications]);

    // Smart-digest hint: show when the latest notification is older than 24h
    // (or there are none at all). Notifications are newest-first from the API.
    const isStale = useMemo(() => {
        if (notifications.length === 0) return true;
        const latest = notifications[0]?.createdAt;
        if (!latest) return true;
        const age = Date.now() - new Date(latest).getTime();
        return age >= TWENTY_FOUR_HOURS;
    }, [notifications]);

    const handleMarkGroupRead = (ids: number[]) => {
        ids.forEach((id) => {
            if (!markReadMutation.isPending) markReadMutation.mutate(id);
        });
    };

    const renderRow = (n: AppNotification) => (
        <MenuItem
            className={!n.read ? styles.unread : undefined}
            onClick={() => handleItemClick(n.id, n.link)}
        >
            <div className={styles.itemContent}>
                <Text
                    className={styles.itemTitle}
                    size={300}
                    weight={n.read ? "regular" : "semibold"}
                >
                    {n.title}
                </Text>
                <Caption1 className={styles.itemBody}>{n.message}</Caption1>
                <Caption1 className={styles.itemTimestamp}>
                    {new Date(n.createdAt).toLocaleString()}
                </Caption1>
            </div>
        </MenuItem>
    );

    return (
        <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}>
            <PopoverTrigger disableButtonEnhancement>
                <Button
                    className={styles.bellButton}
                    appearance="subtle"
                    data-tour="notifications"
                    icon={<Alert24Regular />}
                    aria-label={`${t("notifications.title")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                >
                    {unreadCount > 0 && (
                        <Badge
                            className={styles.badge}
                            appearance="filled"
                            size="small"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverSurface className={styles.popoverSurface}>
                <div className={styles.header}>
                    <Text weight="semibold">{t("notifications.title")}</Text>
                    <div className={styles.headerActions}>
                        <SnoozeButton />
                        {unreadCount > 0 && (
                            <Button
                                appearance="transparent"
                                icon={<Checkmark24Regular />}
                                size="small"
                                onClick={() => markAllMutation.mutate()}
                                disabled={markAllMutation.isPending}
                            >
                                {t("notifications.markAllRead")}
                            </Button>
                        )}
                    </div>
                </div>

                {isLoading && notifications.length === 0 && (
                    <div className={styles.empty} role="status" aria-live="polite" aria-label={t("common.loading")}>
                        <Spinner size="tiny" aria-hidden="true" />
                    </div>
                )}

                {!isLoading && isStale && (
                    <div className={styles.digestHint}>
                        <Clock24Regular />
                        <span>
                            {t(
                                "notificationGroups.digestHint",
                                "No new notifications — check your weekly digest.",
                            )}
                        </span>
                    </div>
                )}

                {!isLoading && !isStale && notifications.length === 0 && (
                    <div className={styles.empty}>{t("notifications.noNotifications")}</div>
                )}

                {notifications.length > 0 && (
                    <MenuList>
                        {GROUP_KEYS.map((key) => {
                            const items = grouped[key];
                            if (items.length === 0) return null;
                            return (
                                <NotificationGroupSection
                                    key={key}
                                    group={key}
                                    label={t(
                                        `notificationGroups.${key}`,
                                        key.charAt(0).toUpperCase() + key.slice(1),
                                    )}
                                    notifications={items}
                                    onItemClick={handleItemClick}
                                    onMarkGroupRead={handleMarkGroupRead}
                                    renderRow={renderRow}
                                />
                            );
                        })}
                    </MenuList>
                )}

                {notifications.length > 0 && (
                    <div className={styles.footer}>
                        <Button
                            appearance="transparent"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                                navigate("/notifications");
                            }}
                        >
                            {t("notifications.viewAll")}
                        </Button>
                    </div>
                )}
            </PopoverSurface>
        </Popover>
    );
}
