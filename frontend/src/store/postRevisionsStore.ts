import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PostRevision {
    id: string;
    postId: number;
    content: string;
    editedAt: string;
    editorName: string;
}

interface PostRevisionsStore {
    revisionsByPost: Record<number, PostRevision[]>;
    addRevision: (postId: number, content: string, editorName: string) => void;
    clearRevisions: (postId: number) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * Demo revisions seeded for posts 1 and 2 so the diff viewer (F54) has
 * something to display before backend integration. Post 1 has three
 * revisions (two edits) to exercise the LCS algorithm; post 2 has two.
 */
const seedRevisions = (): Record<number, PostRevision[]> => {
    const now = Date.now();
    return {
        1: [
            {
                id: generateId(),
                postId: 1,
                content:
                    "Initial draft of the study notes.\nCovers chapters one and two.\nNo examples yet.",
                editedAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
                editorName: "Alex",
            },
            {
                id: generateId(),
                postId: 1,
                content:
                    "Initial draft of the study notes.\nCovers chapters one, two, and three.\nAdded a worked example for chapter two.",
                editedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
                editorName: "Alex",
            },
            {
                id: generateId(),
                postId: 1,
                content:
                    "Final study notes.\nCovers chapters one, two, and three.\nAdded a worked example for chapter two.\nIncludes a summary section at the end.",
                editedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
                editorName: "Sam",
            },
        ],
        2: [
            {
                id: generateId(),
                postId: 2,
                content: "Quick question about the deadline.\nIs it Friday?",
                editedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
                editorName: "Jordan",
            },
            {
                id: generateId(),
                postId: 2,
                content: "Quick question about the deadline.\nIs it Friday or next Monday?",
                editedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
                editorName: "Jordan",
            },
        ],
    };
};

export const usePostRevisionsStore = create<PostRevisionsStore>()(
    persist(
        (set) => ({
            revisionsByPost: seedRevisions(),
            addRevision: (postId, content, editorName) =>
                set((state) => {
                    const existing = state.revisionsByPost[postId] ?? [];
                    const revision: PostRevision = {
                        id: generateId(),
                        postId,
                        content,
                        editedAt: new Date().toISOString(),
                        editorName,
                    };
                    return {
                        revisionsByPost: {
                            ...state.revisionsByPost,
                            [postId]: [...existing, revision],
                        },
                    };
                }),
            clearRevisions: (postId) =>
                set((state) => {
                    const next = { ...state.revisionsByPost };
                    delete next[postId];
                    return { revisionsByPost: next };
                }),
        }),
        { name: "lernchih-post-revisions" },
    ),
);

/** Returns the revisions for a post (empty array if none). */
export function usePostRevisions(postId: number): PostRevision[] {
    return usePostRevisionsStore((s) => s.revisionsByPost[postId] ?? []);
}

export default usePostRevisionsStore;
