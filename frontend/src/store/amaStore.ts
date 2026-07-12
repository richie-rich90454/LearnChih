import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AmaQuestion {
    id: string;
    threadId: number;
    text: string;
    authorName: string;
    upvotes: number;
    answer: string | null;
    pinned: boolean;
    createdAt: string;
}

interface AmaStore {
    questionsByThread: Record<number, AmaQuestion[]>;
    addQuestion: (threadId: number, text: string, authorName: string) => void;
    upvote: (threadId: number, questionId: string) => void;
    pinAnswer: (threadId: number, questionId: string, answer: string) => void;
    unpin: (threadId: number, questionId: string) => void;
    removeQuestion: (threadId: number, questionId: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `ama_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const seedIfMissing = (
    existing: AmaQuestion[] | undefined,
    threadId: number,
): AmaQuestion[] => {
    if (existing && existing.length > 0) return existing;
    return [
        {
            id: generateId(),
            threadId,
            text: "What inspired you to start teaching this subject?",
            authorName: "Alex",
            upvotes: 5,
            answer: null,
            pinned: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: generateId(),
            threadId,
            text: "Which resources do you recommend for beginners?",
            authorName: "Sam",
            upvotes: 3,
            answer: null,
            pinned: false,
            createdAt: new Date().toISOString(),
        },
    ];
};

export const useAmaStore = create<AmaStore>()(
    persist(
        (set) => ({
            questionsByThread: {},
            addQuestion: (threadId, text, authorName) =>
                set((state) => {
                    const list = seedIfMissing(state.questionsByThread[threadId], threadId);
                    const question: AmaQuestion = {
                        id: generateId(),
                        threadId,
                        text,
                        authorName,
                        upvotes: 0,
                        answer: null,
                        pinned: false,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        questionsByThread: {
                            ...state.questionsByThread,
                            [threadId]: [...list, question],
                        },
                    };
                }),
            upvote: (threadId, questionId) =>
                set((state) => {
                    const list = seedIfMissing(state.questionsByThread[threadId], threadId);
                    const next = list.map((q) =>
                        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q,
                    );
                    return {
                        questionsByThread: {
                            ...state.questionsByThread,
                            [threadId]: next,
                        },
                    };
                }),
            pinAnswer: (threadId, questionId, answer) =>
                set((state) => {
                    const list = seedIfMissing(state.questionsByThread[threadId], threadId);
                    const next = list.map((q) =>
                        q.id === questionId ? { ...q, answer, pinned: true } : q,
                    );
                    return {
                        questionsByThread: {
                            ...state.questionsByThread,
                            [threadId]: next,
                        },
                    };
                }),
            unpin: (threadId, questionId) =>
                set((state) => {
                    const list = seedIfMissing(state.questionsByThread[threadId], threadId);
                    const next = list.map((q) =>
                        q.id === questionId ? { ...q, pinned: false } : q,
                    );
                    return {
                        questionsByThread: {
                            ...state.questionsByThread,
                            [threadId]: next,
                        },
                    };
                }),
            removeQuestion: (threadId, questionId) =>
                set((state) => {
                    const list = seedIfMissing(state.questionsByThread[threadId], threadId);
                    return {
                        questionsByThread: {
                            ...state.questionsByThread,
                            [threadId]: list.filter((q) => q.id !== questionId),
                        },
                    };
                }),
        }),
        { name: "lernchih-ama" },
    ),
);

/** Returns the questions for a thread, seeded with demo data on first access. */
export function useAmaQuestions(threadId: number): AmaQuestion[] {
    return useAmaStore((s) => seedIfMissing(s.questionsByThread[threadId], threadId));
}

export default useAmaStore;
