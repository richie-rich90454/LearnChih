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
                    <Label htmlFor="api-key-name">Key name</Label>
                    <Input
                        id="api-key-name"
                        value={newKeyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewKeyName(e.target.value)
                        }
                        placeholder="e.g. CI integration"
                    />
                </div>
                <Button
                    appearance="primary"
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !newKeyName.trim()}
                >
                    {createMutation.isPending ? <Spinner size="tiny" /> : "Generate key"}
                </Button>
            </div>

            {createMutation.data?.data && (
                <MessageBar intent="success">
                    <MessageBarBody>
                        Key generated:{" "}
                        <code>{createMutation.data.data.plaintext}</code>. Copy it now — it
                        won&apos;t be shown again.
                        <Button
                            appearance="subtle"
                            size="small"
                            icon={<Copy24Regular />}
                            onClick={() =>
                                handleCopyPlaintext(createMutation.data!.data.plaintext)
                            }
                        >
                            {copiedId === -1 ? "Copied" : "Copy"}
                        </Button>
                    </MessageBarBody>
                </MessageBar>
            )}

            {isLoading && <Spinner label="Loading API keys..." />}

            {!isLoading && keys.length === 0 && (
                <Text style={{ color: "var(--colorNeutralForeground3)" }}>No API keys yet.</Text>
            )}

            {!isLoading && keys.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Key</TableHeaderCell>
                            <TableHeaderCell>Created</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
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
                                            {key.revoked ? "Revoked" : "Revoke"}
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
