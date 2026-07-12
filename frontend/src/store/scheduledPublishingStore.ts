import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A scheduled-publishing entry. Each item represents a draft slated to be
 * published at a future ISO timestamp.
 *
 * Spec ref: F65.
 */
export interface ScheduledItem {
    id: string;
    title: string;
    /** ISO 8601 timestamp when the item should be published. */
    scheduledFor: string;
    type: "post" | "note" | "resource";
    /** Optional id of the source draft this schedule was created from. */
    draftId?: string;
}

interface ScheduledPublishingStore {
    scheduled: ScheduledItem[];
    schedule: (item: Omit<ScheduledItem, "id">) => string;
    cancel: (id: string) => void;
    list: () => ScheduledItem[];
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useScheduledPublishingStore = create<ScheduledPublishingStore>()(
    persist(
        (set, get) => ({
            scheduled: [],
            schedule: (item) => {
                const id = generateId();
                set((state) => ({
                    scheduled: [...state.scheduled, { ...item, id }],
                }));
                return id;
            },
            cancel: (id) =>
                set((state) => ({
                    scheduled: state.scheduled.filter((s) => s.id !== id),
                })),
            list: () => get().scheduled,
        }),
        { name: "lernchih-scheduled-publishing" },
    ),
);

export default useScheduledPublishingStore;
