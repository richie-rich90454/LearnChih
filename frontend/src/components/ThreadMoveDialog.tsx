import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dropdown,
    Option,
    Toast,
    ToastTitle,
    useToastController,
} from "@fluentui/react-components";
import { ArrowMove24Regular } from "@fluentui/react-icons";
import type { Channel } from "../types";
import { Button } from "./ui/Button";
import styles from "./ThreadMoveDialog.module.css";

interface ThreadMoveDialogProps {
    currentChannelId: number;
    channels: Channel[];
}

/**
 * Moderator action to move the current thread to a different channel (F53).
 * Shows a channel selector; on confirm it dispatches a toast stub ("Move
 * queued").
 *
 * Spec ref: F53.
 */
export function ThreadMoveDialog({ currentChannelId, channels }: ThreadMoveDialogProps) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<string | null>(null);

    const candidates = channels.filter((c) => c.id !== currentChannelId);

    const handleConfirm = () => {
        dispatchToast(
            <Toast>
                <ToastTitle>{t("threadMove.queued", "Move queued")}</ToastTitle>
            </Toast>,
            { intent: "info" },
        );
        setOpen(false);
        setTargetId(null);
    };

    return (
        <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button variant="outline" size="small" icon={<ArrowMove24Regular />}>
                    {t("threadMove.button", "Move thread")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>{t("threadMove.title", "Move thread")}</DialogTitle>
                    <DialogContent>
                        <p className={styles.description}>
                            {t("threadMove.description", "Select a channel to move this thread to.")}
                        </p>
                        {candidates.length === 0 ? (
                            <p className={styles.empty}>
                                {t("threadMove.noCandidates", "No other channels available.")}
                            </p>
                        ) : (
                            <Dropdown
                                placeholder={t("threadMove.selectChannel", "Select channel")}
                                value={
                                    targetId
                                        ? candidates.find((c) => String(c.id) === targetId)?.name ?? ""
                                        : ""
                                }
                                selectedOptions={targetId ? [targetId] : []}
                                onOptionSelect={(_, data) =>
                                    setTargetId(data.optionValue ?? null)
                                }
                            >
                                {candidates.map((c) => (
                                    <Option key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </Option>
                                ))}
                            </Dropdown>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={() => setOpen(false)}>
                            {t("common.cancel", "Cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={!targetId || candidates.length === 0}
                        >
                            {t("threadMove.confirm", "Move")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default ThreadMoveDialog;
