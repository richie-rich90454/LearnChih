import { create } from "zustand";

/**
 * Focus mode state (F63). When enabled, the app shell hides the sidebar and
 * header so the main content fills the viewport for distraction-free reading.
 * Session-only (not persisted) so the user never gets stuck in focus mode
 * across reloads; the command palette's "Toggle focus mode" quick action
 * toggles it back off.
 */
interface FocusModeState {
    focusMode: boolean;
    toggle: () => void;
    set: (on: boolean) => void;
}

export const useFocusModeStore = create<FocusModeState>((set) => ({
    focusMode: false,
    toggle: () => set((s) => ({ focusMode: !s.focusMode })),
    set: (on) => set({ focusMode: on }),
}));
