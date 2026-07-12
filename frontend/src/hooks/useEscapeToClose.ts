import { useEffect } from "react";

/**
 * Escape-to-close overlay listener (B99).
 *
 * Adds a `keydown` listener that fires `onClose` when the Escape key is pressed
 * while an overlay (Dialog, Drawer, Popover, CommandPalette, etc.) is open.
 * This is a fundamental keyboard-accessibility expectation: any element that
 * opens via a trigger must be dismissable with Escape without reaching for the
 * mouse.
 *
 * CONVENTION (B99): Every custom overlay component (one not backed by Fluent
 * UI's Dialog/Popover, which already handle Escape internally) must call this
 * hook with its `isOpen` and `onClose` so keyboard users can dismiss it. The
 * listener is attached to `window` so Escape works even when focus is inside a
 * child input.
 *
 * Usage:
 *   useEscapeToClose({ isOpen: open, onClose: () => setOpen(false) });
 *
 * @param isOpen - whether the overlay is currently open
 * @param onClose - called when Escape is pressed while open
 */
export interface UseEscapeToCloseArgs {
    isOpen: boolean;
    onClose: () => void;
}

export function useEscapeToClose({
    isOpen,
    onClose,
}: UseEscapeToCloseArgs): void {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);
}

export default useEscapeToClose;
