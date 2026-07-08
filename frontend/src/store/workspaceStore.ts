import { create } from "zustand";

/**
 * A single workspace tab. Each tab maps to a route (path) with a human
 * label shown in the tab bar.
 */
export interface WorkspaceTab {
    path: string;
    title: string;
}

interface WorkspaceStore {
    tabs: WorkspaceTab[];
    addTab: (tab: WorkspaceTab) => void;
    removeTab: (path: string) => void;
    hasTab: (path: string) => boolean;
}

/**
 * Session-level (in-memory only) workspace tabs. Not persisted: a fresh
 * page load starts with an empty tab bar, and the current route auto-adds
 * its own tab on mount (see WorkspaceTabs.tsx).
 */
export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
    tabs: [],
    addTab: (tab) => {
        if (get().tabs.some((t) => t.path === tab.path)) return;
        set((state) => ({ tabs: [...state.tabs, tab] }));
    },
    removeTab: (path) => {
        set((state) => ({ tabs: state.tabs.filter((t) => t.path !== path) }));
    },
    hasTab: (path) => get().tabs.some((t) => t.path === path),
}));

export default useWorkspaceStore;
