import { useEffect, useRef } from "react";

/**
 * Restore focus to the dropdown trigger button when the menu closes.
 *
 * (B55) Pattern: dropdown menus that render into a portal can leave focus
 * stranded when they close. This hook records the previously-focused element
 * (typically the trigger Button) on open and returns focus to it when the
 * menu unmounts or `open` flips to false. Pass the current `open` state; the
 * hook returns a ref to attach to the trigger so focus can be restored
 * deterministically regardless of which DOM node held focus last.
 *
 * Usage:
 *   const triggerRef = useDropdownFocusReturn(open);
 *   <button ref={triggerRef} onClick={() => setOpen(true)} />
 *
 * Honors reduced motion / programmatic focus only - no visual animation.
 */
export function useDropdownFocusReturn(open: boolean) {
    const triggerRef = useRef<HTMLElement | null>(null);
    const previouslyFocused = useRef<Element | null>(null);

    useEffect(() => {
        if (open) {
            previouslyFocused.current = document.activeElement;
        } else if (previouslyFocused.current) {
            // Prefer returning to the trigger; fall back to the element that
            // had focus when the menu opened (covers the case where the caller
            // opened the menu programmatically).
            const target =
                (triggerRef.current as HTMLElement | null) ??
                (previouslyFocused.current as HTMLElement | null);
            target?.focus?.({ preventScroll: true });
            previouslyFocused.current = null;
        }
    }, [open]);

    return triggerRef;
}
