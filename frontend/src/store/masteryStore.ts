import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Per-user subject mastery levels (F30). Stores a 1-5 mastery level for each
 * subject by id. 0 means "not yet rated".
 */

interface MasteryStore {
    levels: Record<number, number>;
    setLevel: (subjectId: number, level: number) => void;
    getLevel: (subjectId: number) => number;
}

export const useMasteryStore = create<MasteryStore>()(
    persist(
        (set, get) => ({
            levels: {},
            setLevel: (subjectId: number, level: number) => {
                const clamped = Math.max(1, Math.min(5, Math.round(level)));
                set((state) => ({
                    levels: { ...state.levels, [subjectId]: clamped },
                }));
            },
            getLevel: (subjectId: number) => get().levels[subjectId] ?? 0,
        }),
        { name: "lernchih-subject-mastery" },
    ),
);

export default useMasteryStore;
