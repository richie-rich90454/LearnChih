import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    makeStyles,
    tokens,
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
import { Alert24Regular, Checkmark24Regular } from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../api/notifications";
import { useNotificationStore } from "../store/notificationStore";

const useStyles = makeStyles({
    popoverSurface: {
        width: "320px",
        maxHeight: "400px",
        overflow: "auto",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    empty: {
        padding: tokens.spacingHorizontalL,
        textAlign: "center",
        color: tokens.colorNeutralForeground3,
    },
    unread: {
        backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    footer: {
        display: "flex",
        justifyContent: "center",
        padding: tokens.spacingHorizontalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
});

export default function NotificationBell() {
    const { t } = useTranslation();
    const styles = useStyles();
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

    return (
        <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}>
            <PopoverTrigger disableButtonEnhancement>
                <Button
                    appearance="subtle"
                    icon={<Alert24Regular />}
                    aria-label={`${t("notifications.title")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                >
                    {unreadCount > 0 && (
                        <Badge
                            appearance="filled"
                            color="danger"
                            size="small"
                            style={{ position: "absolute", top: 2, right: 2 }}
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverSurface className={styles.popoverSurface}>
                <div className={styles.header}>
                    <Text weight="semibold">{t("notifications.title")}</Text>
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

                {isLoading && notifications.length === 0 && (
                    <div className={styles.empty}>
                        <Spinner size="tiny" />
                    </div>
                )}

                {!isLoading && notifications.length === 0 && (
                    <div className={styles.empty}>{t("notifications.noNotifications")}</div>
                )}

                <MenuList>
                    {notifications.map((n) => (
                        <MenuItem
                            key={n.id}
                            className={!n.read ? styles.unread : undefined}
                            onClick={() => handleItemClick(n.id, n.link)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    textAlign: "left",
                                }}
                            >
                                <Text size={300} weight={n.read ? "regular" : "semibold"}>
                                    {n.title}
                                </Text>
                                <Caption1 style={{ color: "var(--colorNeutralForeground3)" }}>
                                    {n.message}
                                </Caption1>
                                <Caption1 style={{ color: "var(--colorNeutralForeground3)" }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </Caption1>
                            </div>
                        </MenuItem>
                    ))}
                </MenuList>

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
