import { create } from "zustand";

export interface AppNotification {
    id: number;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    setNotifications: (notifications: AppNotification[]) => void;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}

const countUnread = (items: AppNotification[]) => items.filter((n) => !n.read).length;

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (notifications) =>
        set({ notifications, unreadCount: countUnread(notifications) }),
    addNotification: (notification) =>
        set((state) => {
            if (state.notifications.some((n) => n.id === notification.id)) return state;
            const next = [notification, ...state.notifications];
            return { notifications: next, unreadCount: countUnread(next) };
        }),
    markAsRead: (id) =>
        set((state) => {
            const next = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
            return { notifications: next, unreadCount: countUnread(next) };
        }),
    markAllAsRead: () =>
        set((state) => {
            const next = state.notifications.map((n) => ({ ...n, read: true }));
            return { notifications: next, unreadCount: 0 };
        }),
}));
