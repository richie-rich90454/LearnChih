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
                    Report
                </Button>
            </DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>
                        Report {targetType.toLowerCase().replace("_", " ")}
                    </DialogTitle>
                    <DialogContent className={dialogStyles.content}>
                        <Field label="Reason">
                            <Textarea
                                value={reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setReason(e.target.value)
                                }
                                placeholder="Why are you reporting this?"
                            />
                        </Field>
                    </DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={createReport.isPending}
                            disabled={!reason.trim()}
                            onClick={handleSubmit}
                        >
                            {createReport.isPending ? <Spinner size="tiny" /> : "Submit Report"}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
