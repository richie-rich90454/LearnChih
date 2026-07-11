import { useState } from "react";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    MessageBar,
    MessageBarBody,
    Spinner,
} from "@fluentui/react-components";
import { Key24Regular, Add24Regular, Delete24Regular, Copy24Regular, Gauge24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import {
    useAdminApiKeys,
    useCreateApiKey,
    useRevokeApiKey,
    useApiKeyRateLimit,
    useSetApiKeyRateLimit,
    useApiKeyUsage,
} from "@/hooks/useApiKeys";
import type { ApiKeyScope } from "@/api/apiKeys";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./ApiKeysPage.module.css";

const ALL_SCOPES: ApiKeyScope[] = ["read", "write", "admin"];

function scopeBadgeVariant(scope: ApiKeyScope): BadgeVariant {
    if (scope === "admin") return "danger";
    if (scope === "write") return "accent";
    return "neutral";
}

function RateLimitDialog({
    keyId,
    open,
    onOpenChange,
}: {
    keyId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const { data: limit } = useApiKeyRateLimit(open ? keyId : null);
    const { data: usage } = useApiKeyUsage(open ? keyId : null);
    const setLimit = useSetApiKeyRateLimit();

    const [perMinute, setPerMinute] = useState("60");
    const [perHour, setPerHour] = useState("1000");
    const [perDay, setPerDay] = useState("10000");
    const [seeded, setSeeded] = useState(false);

    if (limit && !seeded) {
        setPerMinute(String(limit.requestsPerMinute));
        setPerHour(String(limit.requestsPerHour));
        setPerDay(String(limit.requestsPerDay));
        setSeeded(true);
    }

    const handleSave = () => {
        if (keyId === null) return;
        setLimit.mutate(
            {
                id: keyId,
                requestsPerMinute: Number(perMinute) || 0,
                requestsPerHour: Number(perHour) || 0,
                requestsPerDay: Number(perDay) || 0,
            },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    const handleClose = () => {
        setSeeded(false);
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, d) => {
                if (!d.open) handleClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("apiKeys.rateLimitTitle")}</DialogTitle>
                    <DialogContent>
                        <div className={styles.rateLimitForm}>
                            <Input
                                label={t("apiKeys.fieldPerMinute")}
                                type="number"
                                value={perMinute}
                                onChange={(_, d) => setPerMinute(d.value)}
                            />
                            <Input
                                label={t("apiKeys.fieldPerHour")}
                                type="number"
                                value={perHour}
                                onChange={(_, d) => setPerHour(d.value)}
                            />
                            <Input
                                label={t("apiKeys.fieldPerDay")}
                                type="number"
                                value={perDay}
                                onChange={(_, d) => setPerDay(d.value)}
                            />
                            {usage && (
                                <div className={styles.usageBox}>
                                    <span className={styles.usageLabel}>
                                        {t("apiKeys.currentUsage")}
                                    </span>
                                    <div className={styles.usageGrid}>
                                        <span>
                                            {t("apiKeys.usageMinute")}:{" "}
                                            <strong>{usage.minute}</strong>
                                        </span>
                                        <span>
                                            {t("apiKeys.usageHour")}:{" "}
                                            <strong>{usage.hour}</strong>
                                        </span>
                                        <span>
                                            {t("apiKeys.usageDay")}:{" "}
                                            <strong>{usage.day}</strong>
                                        </span>
                                        <span>
                                            {t("apiKeys.usageTotal")}:{" "}
                                            <strong>{usage.total}</strong>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outline" onClick={handleClose}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={setLimit.isPending}
                        >
                            {setLimit.isPending ? (
                                <Spinner size="tiny" />
                            ) : (
                                t("common.save")
                            )}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default function ApiKeysPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    const { data: keys, isLoading, isError, refetch } = useAdminApiKeys();
    const createKey = useCreateApiKey();
    const revokeKey = useRevokeApiKey();

    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [scopes, setScopes] = useState<ApiKeyScope[]>(["read"]);
    const [copied, setCopied] = useState(false);
    const [rateLimitKeyId, setRateLimitKeyId] = useState<number | null>(null);

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("apiKeys.title")} — LernChih`}
                    canonicalPath="/admin/api-keys"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const toggleScope = (scope: ApiKeyScope) => {
        setScopes((prev) =>
            prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
        );
    };

    const handleCreate = () => {
        if (!name.trim() || scopes.length === 0) return;
        createKey.mutate(
            { name: name.trim(), scopes },
            {
                onSuccess: () => {
                    setCreateOpen(false);
                    setName("");
                    setScopes(["read"]);
                },
            },
        );
    };

    const handleCopy = (plaintext: string) => {
        navigator.clipboard.writeText(plaintext).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const list = keys ?? [];

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("apiKeys.title")} — LernChih`}
                canonicalPath="/admin/api-keys"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Key24Regular />
                </span>
                <h1 className={styles.title}>{t("apiKeys.title")}</h1>
                <Button
                    variant="primary"
                    icon={<Add24Regular />}
                    onClick={() => setCreateOpen(true)}
                    className={styles.headerAction}
                >
                    {t("apiKeys.create")}
                </Button>
            </header>
            <p className={styles.subtitle}>{t("apiKeys.subtitle")}</p>

            {createKey.data && (
                <Card padding="md" className={styles.plaintextCard}>
                    <div className={styles.plaintextHead}>
                        <Copy24Regular className={styles.plaintextIcon} />
                        <span className={styles.plaintextTitle}>
                            {t("apiKeys.copyNow")}
                        </span>
                    </div>
                    <code className={styles.plaintext}>{createKey.data.plaintext}</code>
                    <Button
                        variant="outline"
                        size="small"
                        icon={<Copy24Regular />}
                        onClick={() => handleCopy(createKey.data!.plaintext)}
                    >
                        {copied ? t("apiKeys.copied") : t("apiKeys.copy")}
                    </Button>
                </Card>
            )}

            {isLoading && <SkeletonList count={3} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h3 className={styles.errorTitle}>{t("apiKeys.loadError")}</h3>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && list.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Key24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("apiKeys.noKeys")}</p>
                </div>
            )}

            {!isLoading && !isError && list.length > 0 && (
                <ul className={styles.keyList}>
                    {list.map((key) => (
                        <li key={key.id}>
                            <Card padding="lg" className={styles.keyCard}>
                                <div className={styles.keyHead}>
                                    <div className={styles.keyMeta}>
                                        <span className={styles.keyName}>
                                            {key.name || t("apiKeys.untitled")}
                                        </span>
                                        <code className={styles.keyPrefix}>{key.prefix}</code>
                                        {key.revoked && (
                                            <Badge variant="danger" size="small">
                                                {t("apiKeys.revoked")}
                                            </Badge>
                                        )}
                                    </div>
                                    {!key.revoked && (
                                        <div className={styles.keyActions}>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                icon={<Gauge24Regular />}
                                                onClick={() => setRateLimitKeyId(key.id)}
                                            >
                                                {t("apiKeys.rateLimit")}
                                            </Button>
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                icon={<Delete24Regular />}
                                                onClick={() => revokeKey.mutate(key.id)}
                                                disabled={revokeKey.isPending}
                                            >
                                                {t("apiKeys.revoke")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.scopeRow}>
                                    {key.scopes.map((scope) => (
                                        <Badge
                                            key={scope}
                                            variant={scopeBadgeVariant(scope)}
                                            size="small"
                                        >
                                            {t(`apiKeys.scopes.${scope}`)}
                                        </Badge>
                                    ))}
                                </div>
                                <div className={styles.keyFooter}>
                                    <span>
                                        {t("apiKeys.createdAt")}:{" "}
                                        {new Date(key.createdAt).toLocaleString()}
                                    </span>
                                    {key.lastUsedAt && (
                                        <span>
                                            {t("apiKeys.lastUsed")}:{" "}
                                            {new Date(key.lastUsedAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={createOpen}
                onOpenChange={(_, d) => {
                    setCreateOpen(d.open);
                    if (!d.open) {
                        setName("");
                        setScopes(["read"]);
                    }
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("apiKeys.createTitle")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.form}>
                                <Input
                                    label={t("apiKeys.fieldName")}
                                    placeholder={t("apiKeys.fieldNamePlaceholder")}
                                    value={name}
                                    onChange={(_, d) => setName(d.value)}
                                />
                                <div className={styles.scopesField}>
                                    <span className={styles.scopesLabel}>
                                        {t("apiKeys.fieldScopes")}
                                    </span>
                                    <div className={styles.scopesList}>
                                        {ALL_SCOPES.map((scope) => (
                                            <Checkbox
                                                key={scope}
                                                checked={scopes.includes(scope)}
                                                onChange={() => toggleScope(scope)}
                                                label={t(`apiKeys.scopes.${scope}`)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                disabled={
                                    createKey.isPending ||
                                    !name.trim() ||
                                    scopes.length === 0
                                }
                            >
                                {createKey.isPending ? (
                                    <Spinner size="tiny" />
                                ) : (
                                    t("apiKeys.createConfirm")
                                )}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <RateLimitDialog
                keyId={rateLimitKeyId}
                open={rateLimitKeyId !== null}
                onOpenChange={(open) => {
                    if (!open) setRateLimitKeyId(null);
                }}
            />
        </div>
    );
}
