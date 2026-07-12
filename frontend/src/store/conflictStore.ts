import { create } from "zustand";

/**
 * A single offline-draft conflict awaiting resolution.
 *
 * Spec ref: F80.
 */
export interface Conflict {
    id: string;
    localText: string;
    serverText: string;
    draftId: string;
}

export type ConflictResolution = "local" | "server" | "merge";

interface ConflictStore {
    conflicts: Conflict[];
    addConflict: (conflict: Conflict) => void;
    resolveConflict: (
        id: string,
        resolution: ConflictResolution,
        mergedText?: string,
    ) => void;
    nextConflict: () => Conflict | undefined;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * In-memory (non-persisted) queue of draft conflicts. The ConflictResolver
 * container renders the head of the queue as a modal dialog; resolving a
 * conflict dequeues it and reveals the next one (if any).
 *
 * Spec ref: F80.
 */
export const useConflictStore = create<ConflictStore>((set, get) => ({
    conflicts: [],
    addConflict: (conflict) =>
        set((state) => {
            // Avoid duplicate queue entries for the same conflict id.
            if (state.conflicts.some((c) => c.id === conflict.id)) return state;
            return { conflicts: [...state.conflicts, conflict] };
        }),
    resolveConflict: (id, _resolution, _mergedText) =>
        set((state) => ({
            conflicts: state.conflicts.filter((c) => c.id !== id),
        })),
    nextConflict: () => get().conflicts[0],
}));

/** Helper to mint a conflict id when the caller does not supply one. */
export function makeConflictId(): string {
    return generateId();
}

export default useConflictStore;
