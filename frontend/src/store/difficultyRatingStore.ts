import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Per-resource difficulty self-rating store (F22). Stores the user's
 * subjective difficulty rating (1-5) for each resource by id.
 */

interface DifficultyRatingStore {
    ratings: Record<number, number>;
    setRating: (resourceId: number, rating: number) => void;
    getRating: (resourceId: number) => number;
}

export const useDifficultyRatingStore = create<DifficultyRatingStore>()(
    persist(
        (set, get) => ({
            ratings: {},
            setRating: (resourceId: number, rating: number) => {
                const clamped = Math.max(1, Math.min(5, Math.round(rating)));
                set((state) => ({
                    ratings: { ...state.ratings, [resourceId]: clamped },
                }));
            },
            getRating: (resourceId: number) => get().ratings[resourceId] ?? 0,
        }),
        { name: "lernchih-difficulty-ratings" },
    ),
);

export default useDifficultyRatingStore;
