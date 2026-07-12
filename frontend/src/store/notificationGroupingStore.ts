import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Persists the expanded/collapsed state of notification groups in the
 * NotificationBell dropdown. Keyed by group id (e.g. "mentions", "system").
 *
 * Spec ref: F77.
 */
interface NotificationGroupingStore {
    collapsed: Record<string, boolean>;
    toggle: (group: string) => void;
    setCollapsed: (group: string, collapsed: boolean) => void;
}

export const useNotificationGroupingStore = create<NotificationGroupingStore>()(
    persist(
        (set) => ({
            collapsed: {},
            toggle: (group) =>
                set((state) => ({
                    collapsed: {
                        ...state.collapsed,
                        [group]: !state.collapsed[group],
                    },
                })),
            setCollapsed: (group, collapsed) =>
                set((state) => ({
                    collapsed: { ...state.collapsed, [group]: collapsed },
                })),
        }),
        { name: "lernchih-notification-groups" },
    ),
);

export default useNotificationGroupingStore;
