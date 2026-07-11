import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Daily study goal store (F21). Tracks the user's configurable daily goal
 * (in minutes) and the minutes studied today. When the calendar day rolls
 * over, `resetIfNewDay()` zeroes out `todayMinutes` and advances `date`.
 *
 * Dates are stored as ISO date strings (YYYY-MM-DD).
 */

interface DailyGoalStore {
    dailyGoalMinutes: number;
    todayMinutes: number;
    date: string;
    setGoal: (minutes: number) => void;
    addMinutes: (minutes: number) => void;
    resetIfNewDay: () => void;
}

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
function todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export const useDailyGoalStore = create<DailyGoalStore>()(
    persist(
        (set, get) => ({
            dailyGoalMinutes: 60,
            todayMinutes: 0,
            date: todayIso(),
            setGoal: (minutes: number) => {
                const clamped = Math.max(1, Math.min(1440, Math.round(minutes)));
                set({ dailyGoalMinutes: clamped });
            },
            addMinutes: (minutes: number) => {
                const state = get();
                // Ensure we're operating on today's bucket.
                const today = todayIso();
                const baseMinutes =
                    state.date === today ? state.todayMinutes : 0;
                set({
                    todayMinutes: Math.max(0, baseMinutes + Math.round(minutes)),
                    date: today,
                });
            },
            resetIfNewDay: () => {
                const state = get();
                const today = todayIso();
                if (state.date !== today) {
                    set({ todayMinutes: 0, date: today });
                }
            },
        }),
        { name: "lernchih-daily-goal" },
    ),
);

export default useDailyGoalStore;
