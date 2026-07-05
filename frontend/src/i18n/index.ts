import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import zh from "./zh.json";

const SUPPORTED_LANGUAGES = ["en", "zh"] as const;
type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

function getSavedLang(): SupportedLang {
    if (typeof localStorage === "undefined") return "en";
    try {
        const raw = localStorage.getItem("lernchih-lang");
        if (raw && SUPPORTED_LANGUAGES.includes(raw as SupportedLang)) {
            return raw as SupportedLang;
        }
    } catch {
        // Ignore localStorage access errors (e.g. private mode).
    }
    return "en";
}

const resources = {
    en: { translation: en },
    zh: { translation: zh },
};

const i18nConfig = {
    resources,
    lng: getSavedLang(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
};

// Initialize i18next once and expose the promise so the app can wait for it
// before mounting. This prevents react-i18next from complaining that no
// instance is available when components first render.
const initPromise = i18n.use(initReactI18next).init(i18nConfig).catch((error) => {
    // Defensive: a bad resource file or plugin failure must not leave the app
    // without an i18n instance. Log the failure and fall back to English.
    // The plugin is already registered on the instance, so reuse it rather
    // than calling use(initReactI18next) again.
    // eslint-disable-next-line no-console
    console.error("i18n initialization failed, falling back to English.", error);
    return i18n.init({
        ...i18nConfig,
        lng: "en",
    });
});

// Keep the HTML lang attribute in sync with the active locale for
// accessibility and SEO. This also centralizes locale persistence so callers
// only need to invoke i18n.changeLanguage().
function syncDocumentLang(lng: string): void {
    if (typeof document !== "undefined") {
        document.documentElement.lang = lng;
    }
    if (typeof localStorage !== "undefined") {
        try {
            localStorage.setItem("lernchih-lang", lng);
        } catch {
            // Ignore localStorage access errors (e.g. private mode).
        }
    }
}

initPromise.then(() => syncDocumentLang(i18n.language));
i18n.on("languageChanged", syncDocumentLang);

export { initPromise };
export default i18n;
