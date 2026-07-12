import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SuspiciousLoginAlert {
    id: string;
    userId: number;
    userName: string;
    ipAddress: string;
    location: string;
    timestamp: string;
    reason: string;
    resolved: boolean;
}

interface SuspiciousLoginStore {
    alerts: SuspiciousLoginAlert[];
    resolveAlert: (id: string) => void;
    addAlert: (alert: SuspiciousLoginAlert) => void;
}

const SEED_ALERTS: SuspiciousLoginAlert[] = [
    {
        id: "alert_1",
        userId: 42,
        userName: "alice",
        ipAddress: "203.0.113.9",
        location: "Unknown region",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        reason: "Login from a new country",
        resolved: false,
    },
    {
        id: "alert_2",
        userId: 58,
        userName: "bob",
        ipAddress: "198.51.100.7",
        location: "Tor exit node",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        reason: "Impossible travel detected",
        resolved: false,
    },
];

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useSuspiciousLoginStore = create<SuspiciousLoginStore>()(
    persist(
        (set) => ({
            alerts: SEED_ALERTS,
            resolveAlert: (id: string) =>
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.id === id ? { ...a, resolved: true } : a,
                    ),
                })),
            addAlert: (alert: SuspiciousLoginAlert) =>
                set((state) => ({
                    alerts: [
                        { ...alert, id: alert.id || generateId() },
                        ...state.alerts,
                    ],
                })),
        }),
        { name: "lernchih-suspicious-logins" },
    ),
);

export default useSuspiciousLoginStore;
