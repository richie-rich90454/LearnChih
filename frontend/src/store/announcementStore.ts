import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AnnouncementSeverity = "info" | "warning" | "critical";

export interface Announcement {
    id: string;
    message: string;
    severity: AnnouncementSeverity;
    active: boolean;
    dismissedBy: string[];
}

interface AnnouncementStore {
    announcements: Announcement[];
    addAnnouncement: (message: string, severity: AnnouncementSeverity) => void;
    dismiss: (id: string, userId: string) => void;
    activate: (id: string) => void;
    deactivate: (id: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SEED_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "ann_seed_welcome",
        message: "Welcome to LernChih! Scheduled maintenance this Sunday 02:00-04:00 UTC.",
        severity: "info",
        active: true,
        dismissedBy: [],
    },
];

export const useAnnouncementStore = create<AnnouncementStore>()(
    persist(
        (set) => ({
            announcements: SEED_ANNOUNCEMENTS,
            addAnnouncement: (message: string, severity: AnnouncementSeverity) =>
                set((state) => ({
                    announcements: [
                        {
                            id: generateId(),
                            message,
                            severity,
                            active: true,
                            dismissedBy: [],
                        },
                        ...state.announcements,
                    ],
                })),
            dismiss: (id: string, userId: string) =>
                set((state) => ({
                    announcements: state.announcements.map((a) =>
                        a.id === id && !a.dismissedBy.includes(userId)
                            ? { ...a, dismissedBy: [...a.dismissedBy, userId] }
                            : a,
                    ),
                })),
            activate: (id: string) =>
                set((state) => ({
                    announcements: state.announcements.map((a) =>
                        a.id === id ? { ...a, active: true } : a,
                    ),
                })),
            deactivate: (id: string) =>
                set((state) => ({
                    announcements: state.announcements.map((a) =>
                        a.id === id ? { ...a, active: false } : a,
                    ),
                })),
        }),
        { name: "lernchih-announcements" },
    ),
);

export default useAnnouncementStore;
