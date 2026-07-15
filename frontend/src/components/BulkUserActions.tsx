import { useState } from "react";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
} from "@fluentui/react-components";
import {
    Pause24Regular,
    ArrowClockwise24Regular,
    Delete24Regular,
    Dismiss24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import styles from "./BulkUserActions.module.css";

export type BulkAction = "SUSPEND" | "ACTIVATE" | "DELETE";

interface BulkUserActionsProps {
    selectedCount: number;
    pending?: boolean;
    onAction: (action: BulkAction) => void;
    onClear: () => void;
}

/**
 * Toolbar shown above the user table when one or more rows are selected.
 * Offers Suspend / Activate / Delete bulk actions. Delete opens a
 * confirmation dialog because it is irreversible.
 */
export function BulkUserActions({
    selectedCount,
    pending,
    onAction,
    onClear,
}: BulkUserActionsProps) {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (selectedCount === 0) {
        return null;
    }

    return (
        <div className={styles.toolbar} role="region" aria-label={t("bulkActions.regionLabel")}>
            <span className={styles.count}>
                {t("bulkActions.selected", { count: selectedCount })}
            </span>
            <div className={styles.actions}>
                <Button
                    variant="outline"
                    size="small"
                    icon={<Pause24Regular />}
                    disabled={pending}
                    onClick={() => onAction("SUSPEND")}
                >
                    {t("bulkActions.suspend")}
                </Button>
                <Button
                    variant="outline"
                    size="small"
                    icon={<ArrowClockwise24Regular />}
                    disabled={pending}
                    onClick={() => onAction("ACTIVATE")}
                >
                    {t("bulkActions.activate")}
                </Button>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<Delete24Regular />}
                    disabled={pending}
                    onClick={() => setConfirmOpen(true)}
                >
                    {t("bulkActions.delete")}
                </Button>
                {pending && <Spinner size="tiny" aria-label={t("common.loading")} />}
            </div>
            <Button
                variant="ghost"
                size="small"
                icon={<Dismiss24Regular />}
                onClick={onClear}
                aria-label={t("bulkActions.clear")}
            >
                {t("bulkActions.clear")}
            </Button>

            <Dialog open={confirmOpen} onOpenChange={(_, d) => setConfirmOpen(d.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("bulkActions.confirmDeleteTitle")}</DialogTitle>
                        <DialogContent>
                            {t("bulkActions.confirmDeleteContent", { count: selectedCount })}
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                disabled={pending}
                                onClick={() => {
                                    setConfirmOpen(false);
                                    onAction("DELETE");
                                }}
                                /* B-ui-168: preserve accessible name while
                                   the pending Spinner replaces the label. */
                                aria-label={
                                    pending ? t("common.delete") : undefined
                                }
                            >
                                {pending ? <Spinner size="tiny" /> : t("common.delete")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}
