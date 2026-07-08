import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import { Button } from "./ui/Button";
import dialogStyles from "./ui/Dialog.module.css";

interface ConfirmDialogProps {
    trigger: React.ReactElement;
    title: string;
    content: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    destructive?: boolean;
}

/**
 * Confirmation dialog. Uses raw Fluent Dialog internals (to preserve the
 * `disableButtonEnhancement` trigger + custom open/close behavior) but skins
 * the surface via the shared Dialog.module.css tokens and the design-system
 * Button primitive. The `destructive` flag is accepted for API compatibility;
 * the design-system Button has no danger variant, so the confirm action uses
 * the primary variant regardless.
 */
export function ConfirmDialog({
    trigger,
    title,
    content,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog>
            <DialogTrigger disableButtonEnhancement>{trigger}</DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>{title}</DialogTitle>
                    <DialogContent className={dialogStyles.content}>{content}</DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <DialogTrigger disableButtonEnhancement>
                            <Button variant="outline">{cancelLabel}</Button>
                        </DialogTrigger>
                        <Button variant="primary" onClick={onConfirm}>
                            {confirmLabel}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
