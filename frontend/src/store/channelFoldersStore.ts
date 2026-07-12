import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChannelFolder {
    id: string;
    name: string;
    channelIds: number[];
    createdAt: string;
}

interface ChannelFoldersStore {
    folders: Record<string, ChannelFolder>;
    createFolder: (name: string) => string;
    renameFolder: (id: string, name: string) => void;
    deleteFolder: (id: string) => void;
    addChannelToFolder: (folderId: string, channelId: number) => void;
    removeChannelFromFolder: (folderId: string, channelId: number) => void;
    folderOfChannel: (channelId: number) => ChannelFolder | undefined;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useChannelFoldersStore = create<ChannelFoldersStore>()(
    persist(
        (set, get) => ({
            folders: {},
            createFolder: (name) => {
                const id = generateId();
                set((state) => ({
                    folders: {
                        ...state.folders,
                        [id]: {
                            id,
                            name,
                            channelIds: [],
                            createdAt: new Date().toISOString(),
                        },
                    },
                }));
                return id;
            },
            renameFolder: (id, name) =>
                set((state) => {
                    const folder = state.folders[id];
                    if (!folder) return state;
                    return {
                        folders: { ...state.folders, [id]: { ...folder, name } },
                    };
                }),
            deleteFolder: (id) =>
                set((state) => {
                    const { [id]: _omit, ...rest } = state.folders;
                    return { folders: rest };
                }),
            addChannelToFolder: (folderId, channelId) =>
                set((state) => {
                    const folder = state.folders[folderId];
                    if (!folder) return state;
                    if (folder.channelIds.includes(channelId)) return state;
                    // Remove from any other folder first (a channel belongs to one folder).
                    const nextFolders: Record<string, ChannelFolder> = {};
                    for (const [fid, f] of Object.entries(state.folders)) {
                        if (fid === folderId) {
                            nextFolders[fid] = {
                                ...f,
                                channelIds: [...f.channelIds, channelId],
                            };
                        } else {
                            nextFolders[fid] = {
                                ...f,
                                channelIds: f.channelIds.filter((cid) => cid !== channelId),
                            };
                        }
                    }
                    return { folders: nextFolders };
                }),
            removeChannelFromFolder: (folderId, channelId) =>
                set((state) => {
                    const folder = state.folders[folderId];
                    if (!folder) return state;
                    return {
                        folders: {
                            ...state.folders,
                            [folderId]: {
                                ...folder,
                                channelIds: folder.channelIds.filter((cid) => cid !== channelId),
                            },
                        },
                    };
                }),
            folderOfChannel: (channelId) => {
                const folders = get().folders;
                return Object.values(folders).find((f) => f.channelIds.includes(channelId));
            },
        }),
        { name: "lernchih-channel-folders" },
    ),
);

export default useChannelFoldersStore;
