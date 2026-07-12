import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Snooze state for notifications. `snoozedUntil` is an ISO date string when
 * the snooze expires, or null when not snoozed. `isSnoozed()` returns false
 * once the expiry time has passed (lazy auto-clear).
 *
 * Spec ref: F79.
 */
interface SnoozeStore {
    snoozedUntil: string | null;
    snooze: (durationMinutes: number) => void;
    unsnooze: () => void;
    isSnoozed: () => boolean;
}

export const useSnoozeStore = create<SnoozeStore>()(
    persist(
        (set, get) => ({
            snoozedUntil: null,
            snooze: (durationMinutes) =>
                set({
                    snoozedUntil: new Date(
                        Date.now() + durationMinutes * 60 * 1000,
                    ).toISOString(),
                }),
            unsnooze: () => set({ snoozedUntil: null }),
            isSnoozed: () => {
                const until = get().snoozedUntil;
                if (!until) return false;
                return new Date(until).getTime() > Date.now();
            },
        }),
        { name: "lernchih-snooze" },
    ),
);

export default useSnoozeStore;
