import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Session {
    id: string;
    device: string;
    browser: string;
    ipAddress: string;
    lastActive: string;
    current: boolean;
}

interface SessionStore {
    sessions: Session[];
    revoke: (id: string) => void;
    revokeAll: () => void;
    revokeOthers: () => void;
}

const SEED_SESSIONS: Session[] = [
    {
        id: "sess_current",
        device: "Windows Desktop",
        browser: "Chrome 124",
        ipAddress: "192.168.1.42",
        lastActive: new Date().toISOString(),
        current: true,
    },
    {
        id: "sess_mobile",
        device: "iPhone 15",
        browser: "Safari 17",
        ipAddress: "10.0.0.12",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        current: false,
    },
    {
        id: "sess_tablet",
        device: "iPad Air",
        browser: "Safari 17",
        ipAddress: "172.16.4.8",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        current: false,
    },
];

export const useSessionStore = create<SessionStore>()(
    persist(
        (set) => ({
            sessions: SEED_SESSIONS,
            revoke: (id: string) =>
                set((state) => ({
                    sessions: state.sessions.filter((s) => s.id !== id),
                })),
            revokeAll: () => set({ sessions: [] }),
            revokeOthers: () =>
                set((state) => ({
                    sessions: state.sessions.filter((s) => s.current),
                })),
        }),
        { name: "lernchih-sessions" },
    ),
);

export default useSessionStore;
