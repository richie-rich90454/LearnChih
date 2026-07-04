import {
    Button,
    Dialog as FluentDialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from "@fluentui/react-components";

export interface DialogProps {
    title: string;
    content: string;
    triggerLabel?: string;
    confirmLabel?: string;
}

export function Dialog({
    title,
    content,
    triggerLabel = "Open",
    confirmLabel = "OK",
}: DialogProps) {
    return (
        <FluentDialog>
            <DialogTrigger>
                <Button>{triggerLabel}</Button>
            </DialogTrigger>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>{content}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button appearance="primary">{confirmLabel}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </FluentDialog>
    );
}
