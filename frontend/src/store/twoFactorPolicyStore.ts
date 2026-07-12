import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TWO_FACTOR_ROLES = ["ADMIN", "MODERATOR", "USER"] as const;
export type TwoFactorRole = (typeof TWO_FACTOR_ROLES)[number];

interface TwoFactorPolicyStore {
    requireForRoles: string[];
    gracePeriodDays: number;
    enforcementEnabled: boolean;
    setRequiredRoles: (roles: string[]) => void;
    setGracePeriod: (days: number) => void;
    toggleEnforcement: () => void;
}

export const useTwoFactorPolicyStore = create<TwoFactorPolicyStore>()(
    persist(
        (set) => ({
            requireForRoles: ["ADMIN"],
            gracePeriodDays: 7,
            enforcementEnabled: false,
            setRequiredRoles: (roles: string[]) => set({ requireForRoles: roles }),
            setGracePeriod: (days: number) => set({ gracePeriodDays: days }),
            toggleEnforcement: () =>
                set((state) => ({ enforcementEnabled: !state.enforcementEnabled })),
        }),
        { name: "lernchih-2fa-policy" },
    ),
);

export default useTwoFactorPolicyStore;
