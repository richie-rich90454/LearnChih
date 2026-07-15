import { useState } from "react";
import {
    makeStyles,
    tokens,
    Button,
    Input,
    Label,
    Text,
    Spinner,
    MessageBar,
    MessageBarBody,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableCellLayout,
} from "@fluentui/react-components";
import { Delete24Regular, Copy24Regular } from "@fluentui/react-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiKeys, createApiKey, revokeApiKey, type ApiKey } from "../api/apiKeys";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    newKeyRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "flex-end",
    },
});

export default function ApiKeyManager() {
    const styles = useStyles();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [newKeyName, setNewKeyName] = useState("");
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
        queryKey: ["apiKeys"],
        queryFn: () => getApiKeys().then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: () => createApiKey(newKeyName, ["read"]),
        onSuccess: () => {
            setNewKeyName("");
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (id: number) => revokeApiKey(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
    });

    const handleCopyPlaintext = (plaintext: string) => {
        navigator.clipboard.writeText(plaintext).then(() => {
            setCopiedId(-1);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.newKeyRow}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: tokens.spacingVerticalXS,
                        flex: 1,
                    }}
                >
                    <Label htmlFor="api-key-name">{t("apiKeys.fieldName")}</Label>
                    <Input
                        id="api-key-name"
                        value={newKeyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewKeyName(e.target.value)
                        }
                        placeholder={t("apiKeys.fieldNamePlaceholder")}
                    />
                </div>
                <Button
                    appearance="primary"
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !newKeyName.trim()}
                    /*
                     * B-ui-161: When pending, the only child is a Fluent
                     * Spinner with no `label` prop, so the button's
                     * accessible name collapses to empty. Mirror the visible
                     * label via aria-label while loading so assistive tech
                     * still announces the action (WCAG 4.1.3 / 1.3.1).
                     */
                    aria-label={
                        createMutation.isPending
                            ? t("apiKeys.createConfirm")
                            : undefined
                    }
                >
                    {createMutation.isPending ? <Spinner size="tiny" /> : t("apiKeys.createConfirm")}
                </Button>
            </div>

            {createMutation.data?.data && (
                <MessageBar intent="success">
                    <MessageBarBody>
                        {t("apiKeys.keyGenerated")}{" "}
                        <code>{createMutation.data.data.plaintext}</code>. {t("apiKeys.copyNow")}
                        <Button
                            appearance="subtle"
                            size="small"
                            icon={<Copy24Regular />}
                            onClick={() =>
                                handleCopyPlaintext(createMutation.data!.data.plaintext)
                            }
                        >
                            {copiedId === -1 ? t("apiKeys.copied") : t("apiKeys.copy")}
                        </Button>
                    </MessageBarBody>
                </MessageBar>
            )}

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} aria-hidden="true" />
                </div>
            )}

            {!isLoading && keys.length === 0 && (
                <Text style={{ color: "var(--colorNeutralForeground3)" }}>{t("apiKeys.noKeys")}</Text>
            )}

            {!isLoading && keys.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>{t("apiKeys.columnName")}</TableHeaderCell>
                            <TableHeaderCell>{t("apiKeys.columnKey")}</TableHeaderCell>
                            <TableHeaderCell>{t("apiKeys.createdAt")}</TableHeaderCell>
                            <TableHeaderCell>{t("apiKeys.columnActions")}</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.map((key) => (
                            <TableRow key={key.id}>
                                <TableCell>
                                    <TableCellLayout>{key.name}</TableCellLayout>
                                </TableCell>
                                <TableCell>
                                    <code>{key.prefix}</code>
                                </TableCell>
                                <TableCell>
                                    {new Date(key.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div
                                        style={{ display: "flex", gap: tokens.spacingHorizontalS }}
                                    >
                                        <Button
                                            appearance="subtle"
                                            icon={<Delete24Regular />}
                                            size="small"
                                            color="danger"
                                            onClick={() => revokeMutation.mutate(key.id)}
                                            disabled={revokeMutation.isPending || key.revoked}
                                        >
                                            {key.revoked ? t("apiKeys.revoked") : t("apiKeys.revoke")}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
