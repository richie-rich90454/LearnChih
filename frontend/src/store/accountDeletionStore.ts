import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DeletionRequest {
    id: string;
    userId: number;
    userName: string;
    email: string;
    requestedAt: string;
    scheduledFor: string;
    cancelled: boolean;
}

interface AccountDeletionStore {
    deletionRequests: DeletionRequest[];
    requestDeletion: (userId: number, userName: string, email: string, graceDays: number) => void;
    cancelDeletion: (id: string) => void;
}

const DEFAULT_GRACE_DAYS = 30;

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SEED_REQUESTS: DeletionRequest[] = [
    {
        id: "del_seed_1",
        userId: 33,
        userName: "dave",
        email: "dave@example.com",
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        scheduledFor: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * (DEFAULT_GRACE_DAYS - 5),
        ).toISOString(),
        cancelled: false,
    },
    {
        id: "del_seed_2",
        userId: 47,
        userName: "eve",
        email: "eve@example.com",
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
        scheduledFor: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * (DEFAULT_GRACE_DAYS - 25),
        ).toISOString(),
        cancelled: false,
    },
];

export const useAccountDeletionStore = create<AccountDeletionStore>()(
    persist(
        (set) => ({
            deletionRequests: SEED_REQUESTS,
            requestDeletion: (userId: number, userName: string, email: string, graceDays: number) =>
                set((state) => ({
                    deletionRequests: [
                        {
                            id: generateId(),
                            userId,
                            userName,
                            email,
                            requestedAt: new Date().toISOString(),
                            scheduledFor: new Date(
                                Date.now() + 1000 * 60 * 60 * 24 * graceDays,
                            ).toISOString(),
                            cancelled: false,
                        },
                        ...state.deletionRequests,
                    ],
                })),
            cancelDeletion: (id: string) =>
                set((state) => ({
                    deletionRequests: state.deletionRequests.map((r) =>
                        r.id === id ? { ...r, cancelled: true } : r,
                    ),
                })),
        }),
        { name: "lernchih-account-deletion" },
    ),
);

export const DEFAULT_DELETION_GRACE_DAYS = DEFAULT_GRACE_DAYS;
export default useAccountDeletionStore;
