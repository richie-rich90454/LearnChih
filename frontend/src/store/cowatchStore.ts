import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CoWatchResource {
    id: string;
    title: string;
    url: string;
}

interface CoWatchSession {
    groupId: number;
    resource: CoWatchResource | null;
    playhead: number;
    isPlaying: boolean;
    updatedAt: string;
}

interface CoWatchStore {
    sessions: Record<number, CoWatchSession>;
    setResource: (groupId: number, resource: CoWatchResource) => void;
    setPlayhead: (groupId: number, position: number) => void;
    setPlaying: (groupId: number, isPlaying: boolean) => void;
    reset: (groupId: number) => void;
}

const emptySession = (groupId: number): CoWatchSession => ({
    groupId,
    resource: null,
    playhead: 0,
    isPlaying: false,
    updatedAt: new Date().toISOString(),
});

export const useCowatchStore = create<CoWatchStore>()(
    persist(
        (set) => ({
            sessions: {},
            setResource: (groupId, resource) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [groupId]: {
                            ...(state.sessions[groupId] ?? emptySession(groupId)),
                            groupId,
                            resource,
                            playhead: 0,
                            isPlaying: false,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                })),
            setPlayhead: (groupId, position) =>
                set((state) => {
                    const existing = state.sessions[groupId] ?? emptySession(groupId);
                    return {
                        sessions: {
                            ...state.sessions,
                            [groupId]: { ...existing, playhead: position, updatedAt: new Date().toISOString() },
                        },
                    };
                }),
            setPlaying: (groupId, isPlaying) =>
                set((state) => {
                    const existing = state.sessions[groupId] ?? emptySession(groupId);
                    return {
                        sessions: {
                            ...state.sessions,
                            [groupId]: { ...existing, isPlaying, updatedAt: new Date().toISOString() },
                        },
                    };
                }),
            reset: (groupId) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [groupId]: emptySession(groupId),
                    },
                })),
        }),
        { name: "lernchih-cowatch" },
    ),
);

export default useCowatchStore;
