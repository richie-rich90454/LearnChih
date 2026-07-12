import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomEmoji {
    id: string;
    name: string;
    dataUrl: string;
    uploadedAt: string;
    uploadedBy: string;
}

interface CustomEmojiStore {
    emojis: CustomEmoji[];
    addEmoji: (name: string, dataUrl: string, uploadedBy: string) => void;
    removeEmoji: (id: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `emoji_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

/** Maximum allowed file size for custom emoji uploads (64 KB). */
export const MAX_EMOJI_SIZE = 64 * 1024;

/** Allowed MIME types for custom emoji uploads. */
export const ALLOWED_EMOJI_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

export const useCustomEmojiStore = create<CustomEmojiStore>()(
    persist(
        (set) => ({
            emojis: [],
            addEmoji: (name, dataUrl, uploadedBy) =>
                set((state) => ({
                    emojis: [
                        ...state.emojis,
                        {
                            id: generateId(),
                            name,
                            dataUrl,
                            uploadedBy,
                            uploadedAt: new Date().toISOString(),
                        },
                    ],
                })),
            removeEmoji: (id) =>
                set((state) => ({
                    emojis: state.emojis.filter((e) => e.id !== id),
                })),
        }),
        { name: "lernchih-custom-emoji" },
    ),
);

export default useCustomEmojiStore;
