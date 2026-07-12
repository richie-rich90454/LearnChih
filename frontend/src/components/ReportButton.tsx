import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Textarea,
    Field,
    Spinner,
} from "@fluentui/react-components";
import { Flag24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useCreateReport } from "../hooks/useReports";
import type { ReportTargetType } from "../types";
import { Button } from "./ui/Button";
import dialogStyles from "./ui/Dialog.module.css";

interface ReportButtonProps {
    targetType: ReportTargetType;
    targetId: number;
    targetTitle?: string;
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const createReport = useCreateReport();

    const handleSubmit = () => {
        createReport.mutate(
            { targetType, targetId, reason },
            {
                onSuccess: () => {
                    setOpen(false);
                    setReason("");
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button variant="subtle" size="small" icon={<Flag24Regular />}>
                    {t("reportDialog.trigger")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>
                        {t("reportDialog.title", {
                            target: targetType.toLowerCase().replace("_", " "),
                        })}
                    </DialogTitle>
                    <DialogContent className={dialogStyles.content}>
                        <Field label={t("reportDialog.reasonLabel")}>
                            <Textarea
                                value={reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setReason(e.target.value)
                                }
                                placeholder={t("reportDialog.reasonPlaceholder")}
                                aria-label={t("reportDialog.reasonLabel")}
                            />
                        </Field>
                    </DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            loading={createReport.isPending}
                            disabled={!reason.trim()}
                            onClick={handleSubmit}
                        >
                            {createReport.isPending ? <Spinner size="tiny" /> : t("reportDialog.submit")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
