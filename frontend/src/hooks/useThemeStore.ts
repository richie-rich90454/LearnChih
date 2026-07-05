import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface ThemeOrigin {
    x?: number;
    y?: number;
}

interface ThemeState {
    mode: ThemeMode;
    origin: ThemeOrigin;
    toggle: (origin?: ThemeOrigin) => void;
    setMode: (mode: ThemeMode, origin?: ThemeOrigin) => void;
}

const THEME_KEY = "lernchih-theme";
const VALID_MODES: ThemeMode[] = ["light", "dark"];

function safeGetTheme(): ThemeMode | null {
    if (typeof localStorage === "undefined") return null;
    try {
        const raw = localStorage.getItem(THEME_KEY);
        return VALID_MODES.includes(raw as ThemeMode) ? (raw as ThemeMode) : null;
    } catch {
        return null;
    }
}

function safeSetTheme(mode: ThemeMode): void {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(THEME_KEY, mode);
    } catch {
        // Ignore storage errors (e.g. private mode quota).
    }
}

const savedMode = safeGetTheme();

const prefersDark =
    typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;

const initialMode: ThemeMode = savedMode || (prefersDark ? "dark" : "light");

export const useThemeStore = create<ThemeState>((set) => ({
    mode: initialMode,
    origin: {},
    toggle: (origin) =>
        set((state) => {
            const next = state.mode === "light" ? "dark" : "light";
            safeSetTheme(next);
            return { mode: next, origin: origin ?? {} };
        }),
    setMode: (mode, origin) => {
        safeSetTheme(mode);
        set({ mode, origin: origin ?? {} });
    },
}));
