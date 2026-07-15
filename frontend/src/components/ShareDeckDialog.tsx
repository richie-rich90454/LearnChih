import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog as FluentDialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    MessageBar,
    MessageBarBody,
    Spinner,
} from "@fluentui/react-components";
import { Share24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    shareDeck,
    type SharedDeckPermission,
} from "../api/sharedDecks";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select, Option } from "./ui/Select";
import styles from "./ShareDeckDialog.module.css";

interface ShareDeckDialogProps {
    deckId: number;
    deckName: string;
    trigger?: React.ReactElement;
}

/**
 * Share-deck dialog (F15). Lets a deck owner share a deck with another user
 * by email or username, choosing a VIEW or EDIT permission. On success the
 * shared-by-me list is invalidated so the FlashcardsPage reflects the change.
 */
export default function ShareDeckDialog({
    deckId,
    deckName,
    trigger,
}: ShareDeckDialogProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [permission, setPermission] =
        useState<SharedDeckPermission>("VIEW");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const shareMutation = useMutation({
        mutationFn: () =>
            shareDeck(deckId, {
                recipientEmailOrUsername: recipient.trim(),
                permission,
            }).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["sharedDecks", "shared-by-me"],
            });
            queryClient.invalidateQueries({ queryKey: ["sharedDecks"] });
            setRecipient("");
            setPermission("VIEW");
            setErrorMsg(null);
            setOpen(false);
        },
        onError: (err: unknown) => {
            const status =
                (err as { response?: { status?: number } })?.response?.status ??
                0;
            setErrorMsg(
                status === 0
                    ? t("shareDeck.errorGeneric")
                    : t("shareDeck.errorGeneric"),
            );
        },
    });

    const handleSubmit = () => {
        if (!recipient.trim()) return;
        setErrorMsg(null);
        shareMutation.mutate();
    };

    const handleOpenChange = (_: unknown, data: { open: boolean }) => {
        setOpen(data.open);
        if (!data.open) {
            setRecipient("");
            setPermission("VIEW");
            setErrorMsg(null);
        }
    };

    return (
        <FluentDialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger disableButtonEnhancement>
                {trigger ?? (
                    <Button
                        variant="outline"
                        size="small"
                        icon={<Share24Regular />}
                    >
                        {t("shareDeck.trigger")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody className={styles.body}>
                    <DialogTitle className={styles.title}>
                        {t("shareDeck.title")}
                    </DialogTitle>
                    <DialogContent className={styles.content}>
                        <p className={styles.deckName}>{deckName}</p>
                        <Input
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder={t("shareDeck.recipientPlaceholder")}
                            wrapperClassName={styles.recipientInput}
                            label={t("shareDeck.recipientLabel")}
                        />
                        <Select
                            value={permission}
                            onChange={(_, data) =>
                                setPermission(
                                    data.value as SharedDeckPermission,
                                )
                            }
                            label={t("shareDeck.permissionLabel")}
                            wrapperClassName={styles.permissionSelect}
                        >
                            <Option value="VIEW">
                                {t("shareDeck.permissionView")}
                            </Option>
                            <Option value="EDIT">
                                {t("shareDeck.permissionEdit")}
                            </Option>
                        </Select>
                        {errorMsg && (
                            <MessageBar intent="error">
                                <MessageBarBody>{errorMsg}</MessageBarBody>
                            </MessageBar>
                        )}
                    </DialogContent>
                    <DialogActions className={styles.footer}>
                        <Button
                            variant="subtle"
                            onClick={() => setOpen(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={
                                !recipient.trim() || shareMutation.isPending
                            }
                            icon={
                                shareMutation.isPending ? (
                                    <Spinner size="tiny" aria-hidden="true" />
                                ) : undefined
                            }
                        >
                            {t("shareDeck.submit")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </FluentDialog>
    );
}
