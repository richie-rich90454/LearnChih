import { useEffect } from "react";

/**
 * Focus the first relevant input on mount so users landing on an auth route
 * can start typing immediately without an extra click. Run once on mount.
 *
 * (B53) The selector prefers the `email` field, then falls back to the first
 * text-like input so it works across Login / Register / ForgotPassword /
 * ResetPassword. Safe to call on routes that conditionally render a form
 * (e.g. ForgotPassword after submit) - the query simply no-ops if no input
 * is present.
 */
export function useFocusFirstInput(): void {
    useEffect(() => {
        document.querySelector<HTMLInputElement>(
            'input[name=email], input[type=email], input[type=text], input[type=password]',
        )?.focus();
    }, []);
}
