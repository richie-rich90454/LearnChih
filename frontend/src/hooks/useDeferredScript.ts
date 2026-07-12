import { useEffect, useState } from "react";

/**
 * Deferred third-party script loader (B90).
 *
 * Injects a non-critical <script> tag only after the browser reaches an idle
 * period (or a fallback timeout), so analytics, chat widgets, and other
 * third-party SDKs never block the initial route paint or interaction.
 *
 * CONVENTION (B90): Third-party scripts that are not needed for first paint
 * (e.g. analytics, error reporting SDKs, chat widgets) must be loaded via this
 * hook instead of a synchronous <script> in index.html. Critical scripts (e.g.
 * the app bundle, auth redirect) should load eagerly. The hook dedupes by src
 * so multiple components requesting the same script share one tag.
 *
 * Usage:
 *   const { loaded, error } = useDeferredScript("https://cdn.example.com/sdk.js", {
 *     timeoutMs: 3000,
 *   });
 */

const loadedScripts = new Set<string>();

export interface UseDeferredScriptArgs {
    /** Fallback delay if requestIdleCallback is unavailable (default 2000ms). */
    timeoutMs?: number;
    /** Additional script attributes (e.g. { async: true, crossOrigin: "anonymous" }). */
    attributes?: Record<string, string>;
    /** Skip loading entirely (e.g. when disabled by a feature flag). */
    enabled?: boolean;
}

export interface UseDeferredScriptResult {
    loaded: boolean;
    error: Error | null;
}

export function useDeferredScript(
    src: string,
    options: UseDeferredScriptArgs = {},
): UseDeferredScriptResult {
    const { timeoutMs = 2000, attributes, enabled = true } = options;
    const [loaded, setLoaded] = useState<boolean>(() =>
        loadedScripts.has(src),
    );
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled || loadedScripts.has(src)) {
            setLoaded(loadedScripts.has(src));
            return;
        }

        let cancelled = false;
        const hasRIC =
            typeof window !== "undefined" &&
            typeof window.requestIdleCallback === "function";

        const inject = () => {
            if (cancelled || loadedScripts.has(src)) return;
            const script = document.createElement("script");
            script.src = src;
            if (attributes) {
                for (const [key, value] of Object.entries(attributes)) {
                    script.setAttribute(key, value);
                }
            }
            script.async = true;
            script.onload = () => {
                if (cancelled) return;
                loadedScripts.add(src);
                setLoaded(true);
            };
            script.onerror = () => {
                if (cancelled) return;
                setError(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        };

        if (hasRIC) {
            const handle = window.requestIdleCallback(() => inject(), {
                timeout: timeoutMs,
            });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(handle);
            };
        }

        const timer = window.setTimeout(inject, timeoutMs);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [src, enabled, timeoutMs, attributes]);

    return { loaded, error };
}

export default useDeferredScript;
