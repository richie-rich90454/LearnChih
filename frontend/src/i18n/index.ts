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

// Auto-discover and deep-merge per-feature i18n fragments. Each fragment file
// is a JSON object with top-level namespace keys (e.g. `webhookCatalog`).
// Vite's `import.meta.glob` runs at build time and bundles the JSON eagerly so
// the merged resources are available synchronously on first render.
type TranslationRecord = Record<string, unknown>;
type LangCode = "en" | "zh";

const enFragments = import.meta.glob<TranslationRecord>(
    "./fragments/*.en.json",
    { eager: true, import: "default" },
);
const zhFragments = import.meta.glob<TranslationRecord>(
    "./fragments/*.zh.json",
    { eager: true, import: "default" },
);

/**
 * Deep-merges `source` into `target`, returning a new object. Arrays and
 * primitives are overwritten; nested objects are merged recursively. Used to
 * fold per-feature i18n fragment files into the main translation bundle.
 */
function deepMerge(
    target: TranslationRecord,
    source: TranslationRecord,
): TranslationRecord {
    const out: TranslationRecord = { ...target };
    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = out[key];
        if (
            srcVal &&
            typeof srcVal === "object" &&
            !Array.isArray(srcVal) &&
            tgtVal &&
            typeof tgtVal === "object" &&
            !Array.isArray(tgtVal)
        ) {
            out[key] = deepMerge(
                tgtVal as TranslationRecord,
                srcVal as TranslationRecord,
            );
        } else {
            out[key] = srcVal;
        }
    }
    return out;
}

/**
 * Combines the base translation resource with every fragment glob result for
 * the given language. Fragments are processed in sorted filename order so the
 * merge is deterministic regardless of file-system enumeration order.
 */
function composeResources(
    base: TranslationRecord,
    fragmentGlob: Record<string, TranslationRecord>,
): TranslationRecord {
    const sortedPaths = Object.keys(fragmentGlob).sort();
    let merged = base;
    for (const path of sortedPaths) {
        const fragment = fragmentGlob[path];
        if (fragment && typeof fragment === "object") {
            merged = deepMerge(merged, fragment);
        }
    }
    return merged;
}

const enMerged = composeResources(en as TranslationRecord, enFragments);
const zhMerged = composeResources(zh as TranslationRecord, zhFragments);

const resources: Record<LangCode, { translation: TranslationRecord }> = {
    en: { translation: enMerged },
    zh: { translation: zhMerged },
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
//
// CONVENTION (B95): Language persistence is centralised here — never write to
// localStorage("lernchih-lang") from components. The language switcher in
// AppLayout calls i18n.changeLanguage(next), which fires the "languageChanged"
// event below; syncDocumentLang then (1) updates <html lang> for a11y/SEO and
// (2) persists the choice to localStorage so the next session restores it via
// getSavedLang() at the top of this module. This single source of truth
// guarantees the restored locale, the document lang, and the persisted value
// always agree.
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
