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
    Input,
    Textarea,
    Field,
    Switch,
    Spinner,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudyGroup, type CreateStudyGroupRequest } from "@/api/studyGroups";

const useStyles = makeStyles({
    form: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
});

interface CreateStudyGroupDialogProps {
    onCreated?: () => void;
}

export function CreateStudyGroupDialog({ onCreated }: CreateStudyGroupDialogProps) {
    const styles = useStyles();
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
                <Button appearance="primary" icon={<Add24Regular />}>
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Create Study Group</DialogTitle>
                    <DialogContent>
                        <div className={styles.form}>
                            <Field label="Name" required>
                                <Input
                                    value={name}
                                    onChange={(_e, data) => setName(data.value)}
                                    placeholder="e.g. Calculus Study Crew"
                                />
                            </Field>
                            <Field label="Description" required>
                                <Textarea
                                    value={description}
                                    onChange={(_e, data) => setDescription(data.value)}
                                    placeholder="What is this group about?"
                                />
                            </Field>
                            <Field label="Subject">
                                <Input
                                    value={subject}
                                    onChange={(_e, data) => setSubject(data.value)}
                                    placeholder="e.g. Mathematics"
                                />
                            </Field>
                            <Switch
                                checked={isPublic}
                                onChange={(_e, data) => setIsPublic(data.checked)}
                                label={isPublic ? "Public group" : "Private group"}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            disabled={!canSubmit || mutation.isPending}
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
