import { useState } from "react";
import {
    Button,
    Input,
    Field,
    makeStyles,
    tokens,
    Divider,
    Spinner,
    MessageBar,
    MessageBarBody,
    Tooltip,
} from "@fluentui/react-components";
import { Add24Regular, Delete24Regular } from "@fluentui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { AxiosResponse } from "axios";
import api from "../api/axios";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    optionRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalS,
    },
});

export interface PollOptionInput {
    text: string;
}

export interface PollInput {
    postId?: number;
    question: string;
    options: string[];
}

interface PollEditorProps {
    postId?: number;
    onSaved?: () => void;
    onCancel?: () => void;
}

/**
 * Create/edit a poll: a question plus a variable list of options.
 * Options can be added and removed; the poll is saved through the API.
 *
 * Spec refs: F1.8–F1.9.
 */
export function PollEditor({ postId, onSaved, onCancel }: PollEditorProps) {
    const styles = useStyles();
    const { t } = useTranslation();
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);

    const saveMutation = useMutation({
        mutationFn: (input: PollInput): Promise<AxiosResponse<unknown>> =>
            api.post<unknown>("/polls", input),
        onSuccess: () => onSaved?.(),
    });

    const updateOption = (index: number, value: string) => {
        setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
    };

    const addOption = () => setOptions((prev) => [...prev, ""]);

    const removeOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    const canSave = question.trim().length > 0 && validOptions.length >= 2;

    const handleSave = () => {
        if (!canSave) return;
        saveMutation.mutate({ postId, question: question.trim(), options: validOptions });
    };

    return (
        <div className={styles.root}>
            <Field label={t("pollEditor.questionLabel")} required>
                <Input
                    value={question}
                    onChange={(_e, data) => setQuestion(data.value)}
                    placeholder={t("pollEditor.questionPlaceholder")}
                />
            </Field>

            <Divider>{t("pollEditor.optionsDivider")}</Divider>

            {options.map((option, index) => (
                <div key={index} className={styles.optionRow}>
                    <Input
                        value={option}
                        onChange={(_e, data) => updateOption(index, data.value)}
                        placeholder={t("pollEditor.optionPlaceholder", { index: index + 1 })}
                        style={{ flex: 1 }}
                    />
                    <Tooltip content={t("pollEditor.removeOption", { index: index + 1 })} relationship="label">
                        <Button
                            appearance="subtle"
                            icon={<Delete24Regular />}
                            disabled={options.length <= 2}
                            onClick={() => removeOption(index)}
                            aria-label={t("pollEditor.removeOption", { index: index + 1 })}
                        />
                    </Tooltip>
                </div>
            ))}

            <Button appearance="subtle" icon={<Add24Regular />} onClick={addOption}>
                {t("pollEditor.addOption")}
            </Button>

            {saveMutation.isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("pollEditor.saveError")}</MessageBarBody>
                </MessageBar>
            )}

            <div className={styles.actions}>
                {onCancel && (
                    <Button appearance="secondary" onClick={onCancel}>
                        {t("common.cancel")}
                    </Button>
                )}
                <Button
                    appearance="primary"
                    onClick={handleSave}
                    disabled={!canSave || saveMutation.isPending}
                    icon={saveMutation.isPending ? <Spinner size="tiny" /> : undefined}
                >
                    {t("pollEditor.save")}
                </Button>
            </div>
        </div>
    );
}

export default PollEditor;
