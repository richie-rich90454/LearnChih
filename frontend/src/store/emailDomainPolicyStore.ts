import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EmailDomainMode = "allowlist" | "denylist" | "open";
export type DomainListName = "allowlist" | "denylist";

interface EmailDomainPolicyStore {
    allowlist: string[];
    denylist: string[];
    mode: EmailDomainMode;
    addDomain: (domain: string, list: DomainListName) => void;
    removeDomain: (domain: string, list: DomainListName) => void;
    setMode: (mode: EmailDomainMode) => void;
}

export const useEmailDomainPolicyStore = create<EmailDomainPolicyStore>()(
    persist(
        (set) => ({
            allowlist: [],
            denylist: [],
            mode: "open",
            addDomain: (domain: string, list: DomainListName) =>
                set((state) => {
                    const normalized = domain.trim().toLowerCase();
                    if (!normalized) return state;
                    const current = state[list];
                    if (current.includes(normalized)) return state;
                    return { [list]: [...current, normalized] } as Pick<
                        EmailDomainPolicyStore,
                        DomainListName
                    >;
                }),
            removeDomain: (domain: string, list: DomainListName) =>
                set((state) => ({
                    [list]: state[list].filter((d) => d !== domain),
                }) as Pick<EmailDomainPolicyStore, DomainListName>),
            setMode: (mode: EmailDomainMode) => set({ mode }),
        }),
        { name: "lernchih-email-domain-policy" },
    ),
);

export default useEmailDomainPolicyStore;
