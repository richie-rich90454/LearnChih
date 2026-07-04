import { create } from "zustand";

interface CookieConsentState {
    hasResponded: boolean;
    necessary: true;
    functional: boolean;
    analytics: boolean;
    setConsent: (functional: boolean, analytics: boolean) => void;
    reset: () => void;
}

const STORAGE_KEY = "lernchih-cookie-consent";

interface PersistedConsent {
    hasResponded: boolean;
    functional: boolean;
    analytics: boolean;
}

function loadConsent(): PersistedConsent {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<PersistedConsent>;
            return {
                hasResponded: !!parsed.hasResponded,
                functional: !!parsed.functional,
                analytics: !!parsed.analytics,
            };
        }
    } catch {
        // ignore malformed storage entries
    }
    return { hasResponded: false, functional: false, analytics: false };
}

function saveConsent(consent: PersistedConsent): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
        // ignore storage errors (e.g. private mode quota)
    }
}

const initial = loadConsent();

const useCookieConsentStore = create<CookieConsentState>((set) => ({
    hasResponded: initial.hasResponded,
    necessary: true,
    functional: initial.functional,
    analytics: initial.analytics,
    setConsent: (functional, analytics) => {
        const next: PersistedConsent = { hasResponded: true, functional, analytics };
        saveConsent(next);
        set({ hasResponded: true, functional, analytics });
    },
    reset: () => {
        const next: PersistedConsent = { hasResponded: false, functional: false, analytics: false };
        saveConsent(next);
        set({ hasResponded: false, functional: false, analytics: false });
    },
}));

export default useCookieConsentStore;
