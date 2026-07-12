import { useCallback } from "react";
import {
    Toast,
    ToastTitle,
    ToastBody,
    ToastFooter,
    Button,
    useToastController,
} from "@fluentui/react-components";

/**
 * Optimistic-update rollback toast (B79).
 *
 * When an optimistic mutation fails and the cache is rolled back, callers
 * should surface a non-blocking toast that explains what happened and offers an
 * "Undo" button so the user can retry or revert their intent. This component
 * centralises that pattern: pass a message and an `onUndo` callback and it
 * dispatches a toast to the shared "main-toaster".
 *
 * CONVENTION (B79): Every optimistic mutation (e.g. upvote, bookmark, delete)
 * should, in its `onError`/rollback path, call `dispatchRollbackToast` with a
 * human message and an undo handler. The toast is transient (auto-dismisses) so
 * it never blocks the UI, but the Undo button lets the user act before the
 * rollback is silently forgotten.
 *
 * Usage:
 *   const { dispatchRollbackToast } = useOptimisticRollbackToast();
 *   // inside a mutation onError:
 *   dispatchRollbackToast("Upvote failed — reverted", () => retry());
 */
export function useOptimisticRollbackToast() {
    const { dispatchToast } = useToastController("main-toaster");

    const dispatchRollbackToast = useCallback(
        (message: string, onUndo: () => void) => {
            dispatchToast(
                <Toast>
                    <ToastTitle>{message}</ToastTitle>
                    <ToastBody>
                        Your change was reverted automatically.
                    </ToastBody>
                    <ToastFooter>
                        <Button
                            size="small"
                            appearance="primary"
                            onClick={onUndo}
                        >
                            Undo
                        </Button>
                    </ToastFooter>
                </Toast>,
                { intent: "warning", timeout: 6000 },
            );
        },
        [dispatchToast],
    );

    return { dispatchRollbackToast };
}

export default useOptimisticRollbackToast;
