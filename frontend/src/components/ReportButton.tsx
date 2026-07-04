import { useState } from "react";
import {
    Button,
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
                <Button appearance="subtle" size="small" icon={<Flag24Regular />}>
                    Report
                </Button>
            </DialogTrigger>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Report {targetType.toLowerCase().replace("_", " ")}</DialogTitle>
                    <DialogContent>
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
                    <DialogActions>
                        <Button appearance="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            disabled={!reason.trim() || createReport.isPending}
                        >
                            {createReport.isPending ? <Spinner size="tiny" /> : "Submit Report"}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
