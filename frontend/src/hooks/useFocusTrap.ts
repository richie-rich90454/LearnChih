import { useEffect, type RefObject } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// B28: Audit note. No element inside the trapped container carries both
// `aria-hidden="true"` and a non-negative tabindex, so focusable elements
// remain reachable by assistive tech. Dialog.tsx renders only visible
// controls (Button/DialogContent) without aria-hidden; the canvas overlays
// in MilestoneConfetti/ThemeTransition use aria-hidden but are non-focusable
// (no tabindex). If a future consumer adds aria-hidden to a focusable node,
// set tabIndex={-1} on it so it is skipped by the selector above.

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
            // B27: restore focus to the element that held it before the trap
            // activated so keyboard users return to their original position
            // (e.g. the trigger button) when the dialog closes.
            previouslyFocused?.focus();
        };
    }, [ref, active]);
}
