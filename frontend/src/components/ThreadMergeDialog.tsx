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
import { Merge24Regular } from "@fluentui/react-icons";
import type { ChannelThread } from "../types";
import { Button } from "./ui/Button";
import styles from "./ThreadMergeDialog.module.css";

interface ThreadMergeDialogProps {
    threadId: number;
    threads: ChannelThread[];
}

/**
 * Moderator action to merge the current thread into another thread in the
 * same channel (F52). Shows a target-thread dropdown; on confirm it dispatches
 * a toast stub ("Merge queued — backend integration required").
 *
 * Spec ref: F52.
 */
export function ThreadMergeDialog({ threadId, threads }: ThreadMergeDialogProps) {
    const { t } = useTranslation();
    const { dispatchToast } = useToastController("main-toaster");
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<string | null>(null);

    const candidates = threads.filter((th) => String(th.id) !== String(threadId));

    const handleConfirm = () => {
        dispatchToast(
            <Toast>
                <ToastTitle>
                    {t("threadMerge.queued", "Merge queued — backend integration required")}
                </ToastTitle>
            </Toast>,
            { intent: "info" },
        );
        setOpen(false);
        setTargetId(null);
    };

    return (
        <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button variant="outline" size="small" icon={<Merge24Regular />}>
                    {t("threadMerge.button", "Merge thread")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>{t("threadMerge.title", "Merge thread")}</DialogTitle>
                    <DialogContent>
                        <p className={styles.description}>
                            {t("threadMerge.description", "Select a target thread to merge this thread into.")}
                        </p>
                        {candidates.length === 0 ? (
                            <p className={styles.empty}>
                                {t("threadMerge.noCandidates", "No other threads in this channel.")}
                            </p>
                        ) : (
                            <Dropdown
                                placeholder={t("threadMerge.selectTarget", "Select target thread")}
                                aria-label={t("threadMerge.selectTarget", "Select target thread")}
                                value={
                                    targetId
                                        ? candidates.find((c) => String(c.id) === targetId)?.title ?? ""
                                        : ""
                                }
                                selectedOptions={targetId ? [targetId] : []}
                                onOptionSelect={(_, data) =>
                                    setTargetId(data.optionValue ?? null)
                                }
                            >
                                {candidates.map((th) => (
                                    <Option key={th.id} value={String(th.id)}>
                                        {th.title}
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
                            {t("threadMerge.confirm", "Merge")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default ThreadMergeDialog;
