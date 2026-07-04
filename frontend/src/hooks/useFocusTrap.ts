import { useEffect, type RefObject } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(ref: RefObject<T>, active: boolean) {
    useEffect(() => {
        if (!active || !ref.current) return;
        const container = ref.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusables.length > 0) focusables[0].focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== "Tab") return;
            const focusableEls = container.querySelectorAll<HTMLElement>(FOCUSABLE);
            if (focusableEls.length === 0) return;
            const first = focusableEls[0];
            const last = focusableEls[focusableEls.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        container.addEventListener("keydown", handleKeyDown);
        return () => {
            container.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [ref, active]);
}
