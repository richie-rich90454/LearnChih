import { useState } from "react";
import {
    Switch,
    MessageBar,
    MessageBarBody,
    Spinner,
} from "@fluentui/react-components";
import {
    Flag24Regular,
    CheckmarkCircle24Regular,
    DismissCircle24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/hooks/useFeatureFlags";
import type { FeatureFlag } from "@/api/featureFlags";
import Seo from "@/components/Seo";
import { SkeletonList } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import styles from "./FeatureFlagsPage.module.css";

function flagBadgeVariant(enabled: boolean): BadgeVariant {
    return enabled ? "success" : "neutral";
}

export default function FeatureFlagsPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [pendingKey, setPendingKey] = useState<string | null>(null);

    const { data: flags, isLoading, isError, refetch } = useFeatureFlags();
    const updateFlag = useUpdateFeatureFlag();

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("featureFlags.title")} — LernChih`}
                    canonicalPath="/admin/feature-flags"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    const handleToggle = (flag: FeatureFlag, next: boolean) => {
        setPendingKey(flag.flagKey);
        updateFlag.mutate(
            { key: flag.flagKey, enabled: next },
            { onSettled: () => setPendingKey(null) },
        );
    };

    const list = flags ?? [];

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("featureFlags.title")} — LernChih`}
                canonicalPath="/admin/feature-flags"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Flag24Regular />
                </span>
                <h1 className={styles.title}>{t("featureFlags.title")}</h1>
            </header>

            <p className={styles.subtitle}>{t("featureFlags.subtitle")}</p>

            {isLoading && <SkeletonList count={3} />}

            {isError && (
                <div role="alert" className={styles.errorState}>
                    <h2 className={styles.errorTitle}>{t("featureFlags.loadError")}</h2>
                    <Button variant="primary" onClick={() => refetch()}>
                        {t("errors.retry")}
                    </Button>
                </div>
            )}

            {!isLoading && !isError && list.length === 0 && (
                <div className={styles.empty} role="status">
                    <span className={styles.emptyIcon} aria-hidden="true">
                        <Flag24Regular />
                    </span>
                    <p className={styles.emptyTitle}>{t("featureFlags.noFlags")}</p>
                </div>
            )}

            {!isLoading && !isError && list.length > 0 && (
                <ul className={styles.flagList}>
                    {list.map((flag) => {
                        const isPending = pendingKey === flag.flagKey;
                        return (
                            <li key={flag.id}>
                                <Card padding="lg" className={styles.flagCard}>
                                    <div className={styles.flagHead}>
                                        <div className={styles.flagMeta}>
                                            <Badge
                                                variant={flagBadgeVariant(flag.enabled)}
                                                size="small"
                                                icon={
                                                    flag.enabled ? (
                                                        <CheckmarkCircle24Regular />
                                                    ) : (
                                                        <DismissCircle24Regular />
                                                    )
                                                }
                                            >
                                                {flag.enabled
                                                    ? t("featureFlags.enabled")
                                                    : t("featureFlags.disabled")}
                                            </Badge>
                                            <code className={styles.flagKey}>
                                                {flag.flagKey}
                                            </code>
                                        </div>
                        <Switch
                            checked={flag.enabled}
                            onChange={(_, d) => handleToggle(flag, d.checked)}
                            disabled={isPending}
                            aria-label={t("featureFlags.toggleAriaLabel", {
                                key: flag.flagKey,
                            })}
                        />
                                    </div>

                                    {flag.description && (
                                        <p className={styles.flagDescription}>
                                            {flag.description}
                                        </p>
                                    )}

                                    <div className={styles.flagFooter}>
                                        {isPending ? (
                                            <span role="status" aria-live="polite" aria-label={t("common.loading")}>
                                                <Spinner size="tiny" aria-hidden="true" />
                                            </span>
                                        ) : (
                                            <span className={styles.lastUpdated}>
                                                {t("featureFlags.lastUpdated", {
                                                    time: new Date(
                                                        flag.updatedAt,
                                                    ).toLocaleString(),
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
