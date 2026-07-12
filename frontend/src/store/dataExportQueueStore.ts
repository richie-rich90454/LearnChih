import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExportJobStatus = "queued" | "processing" | "completed" | "failed";

export interface ExportJob {
    id: string;
    userId: number;
    userName: string;
    requestedAt: string;
    status: ExportJobStatus;
    downloadUrl?: string;
    size?: number;
}

interface DataExportQueueStore {
    jobs: ExportJob[];
    enqueue: (userId: number, userName: string) => void;
    markProcessing: (id: string) => void;
    markCompleted: (id: string, downloadUrl: string, size: number) => void;
    markFailed: (id: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SEED_JOBS: ExportJob[] = [
    {
        id: "job_seed_1",
        userId: 42,
        userName: "alice",
        requestedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: "queued",
    },
    {
        id: "job_seed_2",
        userId: 58,
        userName: "bob",
        requestedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        status: "processing",
    },
    {
        id: "job_seed_3",
        userId: 71,
        userName: "carol",
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        status: "completed",
        downloadUrl: "/exports/carol_gdpr.zip",
        size: 4_500_000,
    },
];

export const useDataExportQueueStore = create<DataExportQueueStore>()(
    persist(
        (set) => ({
            jobs: SEED_JOBS,
            enqueue: (userId: number, userName: string) =>
                set((state) => ({
                    jobs: [
                        {
                            id: generateId(),
                            userId,
                            userName,
                            requestedAt: new Date().toISOString(),
                            status: "queued" as ExportJobStatus,
                        },
                        ...state.jobs,
                    ],
                })),
            markProcessing: (id: string) =>
                set((state) => ({
                    jobs: state.jobs.map((j) =>
                        j.id === id ? { ...j, status: "processing" } : j,
                    ),
                })),
            markCompleted: (id: string, downloadUrl: string, size: number) =>
                set((state) => ({
                    jobs: state.jobs.map((j) =>
                        j.id === id
                            ? { ...j, status: "completed", downloadUrl, size }
                            : j,
                    ),
                })),
            markFailed: (id: string) =>
                set((state) => ({
                    jobs: state.jobs.map((j) =>
                        j.id === id ? { ...j, status: "failed" } : j,
                    ),
                })),
        }),
        { name: "lernchih-data-export-queue" },
    ),
);

export default useDataExportQueueStore;
