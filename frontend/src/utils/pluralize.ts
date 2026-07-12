/**
 * Locale-aware pluralization (B94).
 *
 * English has singular/plural forms (1 item vs 2 items). Chinese (zh) has no
 * grammatical plural — the same noun is used regardless of count. This utility
 * picks the correct form based on count and locale, defaulting to the plural
 * form for English when count !== 1, and always the singular for Chinese.
 *
 * CONVENTION (B94): When displaying a count + noun (e.g. "3 notes" / "3 条笔记"),
 * always use `pluralize` instead of a ternary on the count. This keeps
 * pluralization rules centralized and correct for both supported locales.
 *
 * Usage:
 *   pluralize(0, "item", "items", "en")   // "items"
 *   pluralize(1, "item", "items", "en")   // "item"
 *   pluralize(5, "item", "items", "en")   // "items"
 *   pluralize(5, "项", "项", "zh")        // "项"
 */

/**
 * Returns the singular or plural noun based on the count and locale.
 *
 * @param count - the number of items
 * @param singular - the singular form (used for zh always; en when count === 1)
 * @param plural - the plural form (used for en when count !== 1)
 * @param locale - i18next language code (e.g. "en", "zh"); defaults to "en"
 */
export function pluralize(
    count: number,
    singular: string,
    plural: string,
    locale?: string,
): string {
    const lang = (locale ?? "en").startsWith("zh") ? "zh" : "en";
    if (lang === "zh") {
        // Chinese has no plural form — always singular.
        return singular;
    }
    return count === 1 ? singular : plural;
}

/**
 * Returns "{count} {noun}" with the correct pluralization for the locale.
 * Convenience wrapper for the common "{n} items" pattern.
 */
export function pluralizeCount(
    count: number,
    singular: string,
    plural: string,
    locale?: string,
): string {
    const noun = pluralize(count, singular, plural, locale);
    return `${count} ${noun}`;
}

export default pluralize;
