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
    Switch,
    Spinner,
} from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createStudyGroup, type CreateStudyGroupRequest } from "@/api/studyGroups";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import dialogStyles from "./ui/Dialog.module.css";
import styles from "./CreateStudyGroupDialog.module.css";

interface CreateStudyGroupDialogProps {
    onCreated?: () => void;
}

export function CreateStudyGroupDialog({ onCreated }: CreateStudyGroupDialogProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const mutation = useMutation({
        mutationFn: (data: CreateStudyGroupRequest) => createStudyGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyGroups"] });
            setOpen(false);
            reset();
            onCreated?.();
        },
    });

    const reset = () => {
        setName("");
        setDescription("");
        setSubject("");
        setIsPublic(true);
    };

    const canSubmit = name.trim() && description.trim();

    return (
        <Dialog
            open={open}
            onOpenChange={(_: unknown, data: { open: boolean }) => setOpen(data.open)}
        >
            <DialogTrigger disableButtonEnhancement>
                <Button variant="primary" icon={<Add24Regular />}>
                    {t("createStudyGroup.trigger")}
                </Button>
            </DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>
                        {t("createStudyGroup.title")}
                    </DialogTitle>
                    <DialogContent className={dialogStyles.content}>
                        <div className={styles.form}>
                            <Input
                                label={t("createStudyGroup.nameLabel")}
                                required
                                value={name}
                                onChange={(_e, data) => setName(data.value)}
                                placeholder={t("createStudyGroup.namePlaceholder")}
                            />
                            <Field label={t("createStudyGroup.descriptionLabel")} required>
                                <Textarea
                                    value={description}
                                    onChange={(_e, data) => setDescription(data.value)}
                                    placeholder={t("createStudyGroup.descriptionPlaceholder")}
                                    aria-label={t("createStudyGroup.descriptionLabel")}
                                />
                            </Field>
                            <Input
                                label={t("createStudyGroup.subjectLabel")}
                                value={subject}
                                onChange={(_e, data) => setSubject(data.value)}
                                placeholder={t("createStudyGroup.subjectPlaceholder")}
                            />
                            <Switch
                                checked={isPublic}
                                onChange={(_e, data) => setIsPublic(data.checked)}
                                label={isPublic ? t("createStudyGroup.publicLabel") : t("createStudyGroup.privateLabel")}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            loading={mutation.isPending}
                            disabled={!canSubmit}
                            onClick={() =>
                                mutation.mutate({
                                    name: name.trim(),
                                    description: description.trim(),
                                    subject,
                                    isPublic,
                                })
                            }
                            /* B-ui-169: preserve accessible name while the
                               pending Spinner replaces the visible label. */
                            aria-label={
                                mutation.isPending
                                    ? t("createStudyGroup.create")
                                    : undefined
                            }
                        >
                            {mutation.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("createStudyGroup.create")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default CreateStudyGroupDialog;
