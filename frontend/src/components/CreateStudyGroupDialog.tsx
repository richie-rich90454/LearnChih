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
import { createStudyGroup, type CreateStudyGroupRequest } from "@/api/studyGroups";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import dialogStyles from "./ui/Dialog.module.css";
import styles from "./CreateStudyGroupDialog.module.css";

interface CreateStudyGroupDialogProps {
    onCreated?: () => void;
}

export function CreateStudyGroupDialog({ onCreated }: CreateStudyGroupDialogProps) {
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
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogSurface className={dialogStyles.surface}>
                <DialogBody className={dialogStyles.body}>
                    <DialogTitle className={dialogStyles.title}>Create Study Group</DialogTitle>
                    <DialogContent className={dialogStyles.content}>
                        <div className={styles.form}>
                            <Input
                                label="Name"
                                required
                                value={name}
                                onChange={(_e, data) => setName(data.value)}
                                placeholder="e.g. Calculus Study Crew"
                            />
                            <Field label="Description" required>
                                <Textarea
                                    value={description}
                                    onChange={(_e, data) => setDescription(data.value)}
                                    placeholder="What is this group about?"
                                />
                            </Field>
                            <Input
                                label="Subject"
                                value={subject}
                                onChange={(_e, data) => setSubject(data.value)}
                                placeholder="e.g. Mathematics"
                            />
                            <Switch
                                checked={isPublic}
                                onChange={(_e, data) => setIsPublic(data.checked)}
                                label={isPublic ? "Public group" : "Private group"}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className={dialogStyles.footer}>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
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
                        >
                            {mutation.isPending ? <Spinner size="tiny" /> : "Create"}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default CreateStudyGroupDialog;
