import { create } from "zustand";
import type { AuthUser } from "../types";

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    setAuth: (token: string, user: AuthUser) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

function safeGetItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        // localStorage may be unavailable in private mode or with cookies blocked.
        return null;
    }
}

function safeSetItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage errors (e.g. private mode quota).
    }
}

function safeRemoveItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage errors.
    }
}

function loadUser(): AuthUser | null {
    const raw = safeGetItem(USER_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as AuthUser;
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        safeRemoveItem(USER_KEY);
        return null;
    }
}

const useAuthStore = create<AuthState>((set) => ({
    token: safeGetItem(TOKEN_KEY),
    user: loadUser(),
    setAuth: (token: string, user: AuthUser) => {
        safeSetItem(TOKEN_KEY, token);
        safeSetItem(USER_KEY, JSON.stringify(user));
        set({ token, user });
    },
    logout: () => {
        safeRemoveItem(TOKEN_KEY);
        safeRemoveItem(USER_KEY);
        set({ token: null, user: null });
    },
    isAuthenticated: () => !!safeGetItem(TOKEN_KEY),
}));

export default useAuthStore;
