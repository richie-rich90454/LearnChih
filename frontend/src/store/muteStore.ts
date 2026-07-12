import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A mute entry for a thread or channel. `until` is an ISO date string when
 * the mute expires, or null for an indefinite ("until I unmute") mute.
 *
 * IDs are namespaced like `thread:123` or `channel:45`.
 *
 * Spec ref: F78.
 */
export interface MuteEntry {
    id: string;
    type: "thread" | "channel";
    /** ISO date when the mute expires, or null for forever. */
    until: string | null;
    createdAt: string;
}

interface MuteStore {
    muted: Record<string, MuteEntry>;
    mute: (id: string, type: "thread" | "channel", durationMinutes: number | null) => void;
    unmute: (id: string) => void;
    isMuted: (id: string) => boolean;
    clearExpired: () => void;
}

export const useMuteStore = create<MuteStore>()(
    persist(
        (set, get) => ({
            muted: {},
            mute: (id, type, durationMinutes) => {
                const until =
                    durationMinutes === null
                        ? null
                        : new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
                set((state) => ({
                    muted: {
                        ...state.muted,
                        [id]: {
                            id,
                            type,
                            until,
                            createdAt: new Date().toISOString(),
                        },
                    },
                }));
            },
            unmute: (id) =>
                set((state) => {
                    const { [id]: _, ...rest } = state.muted;
                    return { muted: rest };
                }),
            isMuted: (id) => {
                const entry = get().muted[id];
                if (!entry) return false;
                // null until = forever.
                if (entry.until === null) return true;
                return new Date(entry.until).getTime() > Date.now();
            },
            clearExpired: () =>
                set((state) => {
                    const next: Record<string, MuteEntry> = {};
                    for (const [id, entry] of Object.entries(state.muted)) {
                        if (entry.until === null || new Date(entry.until).getTime() > Date.now()) {
                            next[id] = entry;
                        }
                    }
                    return { muted: next };
                }),
        }),
        { name: "lernchih-mute" },
    ),
);

export default useMuteStore;
