import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OAuthProvider = "google" | "github" | "microsoft" | "apple";

export interface OAuthAccount {
    id: string;
    provider: OAuthProvider;
    email: string;
    connectedAt: string;
}

interface OAuthAccountsStore {
    connected: OAuthAccount[];
    connect: (provider: OAuthProvider, email: string) => void;
    disconnect: (id: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `oauth_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SEED_ACCOUNTS: OAuthAccount[] = [
    {
        id: "oauth_seed_google",
        provider: "google",
        email: "user@example.com",
        connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
];

export const useOAuthAccountsStore = create<OAuthAccountsStore>()(
    persist(
        (set) => ({
            connected: SEED_ACCOUNTS,
            connect: (provider: OAuthProvider, email: string) =>
                set((state) => ({
                    connected: [
                        {
                            id: generateId(),
                            provider,
                            email,
                            connectedAt: new Date().toISOString(),
                        },
                        ...state.connected,
                    ],
                })),
            disconnect: (id: string) =>
                set((state) => ({
                    connected: state.connected.filter((a) => a.id !== id),
                })),
        }),
        { name: "lernchih-oauth-accounts" },
    ),
);

export const OAUTH_PROVIDERS: OAuthProvider[] = ["google", "github", "microsoft", "apple"];
export default useOAuthAccountsStore;
