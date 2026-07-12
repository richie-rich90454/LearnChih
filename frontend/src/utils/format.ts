/**
 * Locale-aware number and date formatting utilities (B92).
 *
 * Standalone (non-hook) wrappers around Intl.NumberFormat and
 * Intl.DateTimeFormat so components that are not inside a React render cycle
 * (e.g. API mappers, utility functions, test helpers) can still format values
 * consistently with the active locale. For React components, prefer the
 * `useFormat` hook (src/hooks/useFormat.ts) which reads the locale from the
 * i18next context automatically.
 *
 * CONVENTION (B92): Never call `.toLocaleString()` / `.toLocaleDateString()`
 * without an explicit locale — the browser default may not match the app's
 * active language. Always pass the locale through these helpers (or the
 * useFormat hook) so zh/en formatting is deterministic.
 */

/** Maps an i18next language code to an Intl locale tag. */
export function resolveLocale(lang?: string): string {
    if (!lang) return "en-US";
    return lang.startsWith("zh") ? "zh-CN" : "en-US";
}

/**
 * Formats a number for the given locale using Intl.NumberFormat.
 * @param value - the number to format
 * @param locale - i18next language code (e.g. "en", "zh"); defaults to en-US
 * @param options - Intl.NumberFormatOptions (e.g. { style: "percent" })
 */
export function formatNumber(
    value: number,
    locale?: string,
    options?: Intl.NumberFormatOptions,
): string {
    return new Intl.NumberFormat(resolveLocale(locale), options).format(value);
}

/**
 * Formats a date for the given locale using Intl.DateTimeFormat.
 * @param date - a Date or ISO string
 * @param locale - i18next language code (e.g. "en", "zh"); defaults to en-US
 * @param options - Intl.DateTimeFormatOptions (defaults to short date)
 */
export function formatDate(
    date: string | Date,
    locale?: string,
    options?: Intl.DateTimeFormatOptions,
): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(
        resolveLocale(locale),
        options ?? { year: "numeric", month: "short", day: "numeric" },
    ).format(d);
}

export default { formatNumber, formatDate, resolveLocale };
