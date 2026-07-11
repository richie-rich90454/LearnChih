import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookmarkItem {
    resourceId: number;
    title: string;
    url?: string;
    addedAt: string;
    /** Optional folder id (F76). Bookmarks without a folderId live at the root. */
    folderId?: string | null;
}

export interface BookmarkFolder {
    id: string;
    name: string;
    /** Optional parent folder id for nesting (F76). Top-level folders have null. */
    parentId?: string | null;
    createdAt: string;
}

interface BookmarkStore {
    bookmarks: Record<number, BookmarkItem>;
    folders: Record<string, BookmarkFolder>;
    isBookmarked: (resourceId: number) => boolean;
    toggleBookmark: (resourceId: number, title: string, url?: string) => void;
    addBookmark: (resourceId: number, title: string, url?: string) => void;
    removeBookmark: (resourceId: number) => void;
    moveBookmark: (resourceId: number, folderId: string | null) => void;
    createFolder: (name: string, parentId?: string | null) => string;
    renameFolder: (folderId: string, name: string) => void;
    deleteFolder: (folderId: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useBookmarkStore = create<BookmarkStore>()(
    persist(
        (set, get) => ({
            bookmarks: {},
            folders: {},
            isBookmarked: (resourceId: number) => !!get().bookmarks[resourceId],
            toggleBookmark: (resourceId: number, title: string, url?: string) => {
                if (get().bookmarks[resourceId]) {
                    get().removeBookmark(resourceId);
                } else {
                    get().addBookmark(resourceId, title, url);
                }
            },
            addBookmark: (resourceId: number, title: string, url?: string) =>
                set((state) => ({
                    bookmarks: {
                        ...state.bookmarks,
                        [resourceId]: {
                            resourceId,
                            title,
                            url,
                            addedAt: new Date().toISOString(),
                            folderId: null,
                        },
                    },
                })),
            removeBookmark: (resourceId: number) =>
                set((state) => {
                    const { [resourceId]: _, ...rest } = state.bookmarks;
                    return { bookmarks: rest };
                }),
            moveBookmark: (resourceId: number, folderId: string | null) =>
                set((state) => {
                    const bm = state.bookmarks[resourceId];
                    if (!bm) return state;
                    return {
                        bookmarks: {
                            ...state.bookmarks,
                            [resourceId]: { ...bm, folderId },
                        },
                    };
                }),
            createFolder: (name: string, parentId: string | null = null) => {
                const id = generateId();
                set((state) => ({
                    folders: {
                        ...state.folders,
                        [id]: {
                            id,
                            name,
                            parentId,
                            createdAt: new Date().toISOString(),
                        },
                    },
                }));
                return id;
            },
            renameFolder: (folderId: string, name: string) =>
                set((state) => {
                    const folder = state.folders[folderId];
                    if (!folder) return state;
                    return {
                        folders: {
                            ...state.folders,
                            [folderId]: { ...folder, name },
                        },
                    };
                }),
            deleteFolder: (folderId: string) =>
                set((state) => {
                    // Recursively collect descendant folder ids (DFS).
                    const toDelete = new Set<string>();
                    const stack = [folderId];
                    while (stack.length) {
                        const id = stack.pop()!;
                        toDelete.add(id);
                        for (const f of Object.values(state.folders)) {
                            if (f.parentId === id) stack.push(f.id);
                        }
                    }
                    const nextFolders: Record<string, BookmarkFolder> = {};
                    for (const [id, f] of Object.entries(state.folders)) {
                        if (!toDelete.has(id)) nextFolders[id] = f;
                    }
                    // Reassign bookmarks in deleted folders back to root.
                    const nextBookmarks: Record<number, BookmarkItem> = {};
                    for (const [id, bm] of Object.entries(state.bookmarks)) {
                        const numId = Number(id);
                        if (bm.folderId && toDelete.has(bm.folderId)) {
                            nextBookmarks[numId] = { ...bm, folderId: null };
                        } else {
                            nextBookmarks[numId] = bm;
                        }
                    }
                    return { folders: nextFolders, bookmarks: nextBookmarks };
                }),
        }),
        { name: "lernchih-bookmarks" },
    ),
);

export default useBookmarkStore;
