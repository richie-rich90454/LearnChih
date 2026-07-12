import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChannelPinningStore {
    pinnedIds: number[];
    pin: (id: number) => void;
    unpin: (id: number) => void;
    reorderPinned: (ids: number[]) => void;
    isPinned: (id: number) => boolean;
}

export const useChannelPinningStore = create<ChannelPinningStore>()(
    persist(
        (set, get) => ({
            pinnedIds: [],
            pin: (id) =>
                set((state) => {
                    if (state.pinnedIds.includes(id)) return state;
                    return { pinnedIds: [...state.pinnedIds, id] };
                }),
            unpin: (id) =>
                set((state) => ({
                    pinnedIds: state.pinnedIds.filter((p) => p !== id),
                })),
            reorderPinned: (ids) =>
                set((state) => {
                    const currentSet = new Set(state.pinnedIds);
                    const reordered = ids.filter((id) => currentSet.has(id));
                    return { pinnedIds: reordered };
                }),
            isPinned: (id) => get().pinnedIds.includes(id),
        }),
        { name: "lernchih-channel-pinning" },
    ),
);

export default useChannelPinningStore;
