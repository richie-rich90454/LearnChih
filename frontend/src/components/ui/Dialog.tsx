import { type ReactElement, type ReactNode } from "react";
import {
    Dialog as FluentDialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from "@fluentui/react-components";
import { Button } from "./Button";
import styles from "./Dialog.module.css";

/**
 * Extended Dialog props. The original simple API (title / content /
 * triggerLabel / confirmLabel) is preserved for backward compatibility.
 * New optional slot make the dialog composable:
 *  - `trigger`:   custom trigger element (replaces triggerLabel button)
 *  - `footer`:    custom footer node (replaces confirm button)
 *  - `onConfirm`: invoked when the default confirm button is clicked
 */
export interface DialogProps {
    title: string;
    content: string;
    triggerLabel?: string;
    confirmLabel?: string;
    trigger?: ReactElement;
    footer?: ReactNode;
    onConfirm?: () => void;
}

export function Dialog({
    title,
    content,
    triggerLabel = "Open",
    confirmLabel = "OK",
    trigger,
    footer,
    onConfirm,
}: DialogProps) {
    return (
        <FluentDialog>
            <DialogTrigger>
                {trigger ?? <Button variant="primary">{triggerLabel}</Button>}
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody className={styles.body}>
                    <DialogTitle className={styles.title}>{title}</DialogTitle>
                    <DialogContent className={styles.content}>{content}</DialogContent>
                    <DialogActions className={styles.footer}>
                        {footer ?? (
                            <DialogTrigger>
                                <Button variant="primary" onClick={onConfirm}>
                                    {confirmLabel}
                                </Button>
                            </DialogTrigger>
                        )}
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </FluentDialog>
    );
}
