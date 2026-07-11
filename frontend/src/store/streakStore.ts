import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Learning streak with a once-per-week freeze (F20).
 *
 * A "freeze" may be used at most once per ISO week (Monday-Sunday). Using a
 * freeze preserves the streak for that day: it sets `lastStudyDate` to the
 * frozen day without incrementing the streak, so the next `recordStudyDay`
 * sees a continuous streak.
 *
 * Dates are stored as ISO date strings (YYYY-MM-DD).
 */

interface StreakStore {
    currentStreak: number;
    lastStudyDate: string | null;
    freezesUsedThisWeek: number;
    weekStart: string;
    recordStudyDay: (date: string) => void;
    useFreeze: (date: string) => void;
    canUseFreeze: (date: string) => boolean;
}

/** Returns the Monday (start of ISO week) for the given date as YYYY-MM-DD. */
function getWeekStart(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);
    const day = date.getDay(); // 0 = Sun ... 6 = Sat
    // ISO week starts Monday. Shift so Monday is 0.
    const diff = (day + 6) % 7;
    date.setDate(date.getDate() - diff);
    return toIsoDate(date);
}

/** Formats a Date as YYYY-MM-DD using UTC parts to avoid DST drift. */
function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export function todayIso(): string {
    return toIsoDate(new Date());
}

/** Returns true if `a` is the calendar day immediately before `b`. */
function isPreviousDay(a: string, b: string): boolean {
    const aDate = new Date(`${a}T00:00:00`);
    const bDate = new Date(`${b}T00:00:00`);
    const diffDays = Math.round(
        (bDate.getTime() - aDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays === 1;
}

export const useStreakStore = create<StreakStore>()(
    persist(
        (set, get) => ({
            currentStreak: 0,
            lastStudyDate: null,
            freezesUsedThisWeek: 0,
            weekStart: "",
            recordStudyDay: (date: string) => {
                const state = get();
                if (state.lastStudyDate === date) return; // already studied today

                const weekStart = getWeekStart(date);
                const isNewWeek = state.weekStart !== weekStart;
                const freezesUsedThisWeek = isNewWeek ? 0 : state.freezesUsedThisWeek;

                let nextStreak = 1;
                if (state.lastStudyDate && isPreviousDay(state.lastStudyDate, date)) {
                    nextStreak = state.currentStreak + 1;
                }

                set({
                    currentStreak: nextStreak,
                    lastStudyDate: date,
                    weekStart,
                    freezesUsedThisWeek,
                });
            },
            canUseFreeze: (date: string) => {
                const state = get();
                const weekStart = getWeekStart(date);
                if (state.weekStart !== weekStart) {
                    // New week: freeze budget reset to 1.
                    return true;
                }
                return state.freezesUsedThisWeek < 1;
            },
            useFreeze: (date: string) => {
                const state = get();
                if (!state.canUseFreeze(date)) return;
                const weekStart = getWeekStart(date);
                // Preserve the streak by advancing lastStudyDate to the frozen
                // day WITHOUT incrementing currentStreak.
                set({
                    lastStudyDate: date,
                    weekStart,
                    freezesUsedThisWeek:
                        state.weekStart === weekStart ? state.freezesUsedThisWeek + 1 : 1,
                });
            },
        }),
        { name: "lernchih-streak" },
    ),
);

export default useStreakStore;
