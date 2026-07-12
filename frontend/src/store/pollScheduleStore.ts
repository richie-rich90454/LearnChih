import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PollScheduleStore {
    closesAt: Record<number, string | null>;
    scheduleClose: (pollId: number, closesAt: string | null) => void;
    clearClose: (pollId: number) => void;
}

export const usePollScheduleStore = create<PollScheduleStore>()(
    persist(
        (set) => ({
            closesAt: {},
            scheduleClose: (pollId, closesAt) =>
                set((state) => ({
                    closesAt: { ...state.closesAt, [pollId]: closesAt },
                })),
            clearClose: (pollId) =>
                set((state) => {
                    const { [pollId]: _omit, ...rest } = state.closesAt;
                    return { closesAt: rest };
                }),
        }),
        { name: "lernchih-poll-schedule" },
    ),
);

export default usePollScheduleStore;
