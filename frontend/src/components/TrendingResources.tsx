import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Card,
    Badge,
    Subtitle2,
    Caption1,
    makeStyles,
    tokens,
    Spinner,
    MessageBar,
    MessageBarBody,
    Title3,
} from "@fluentui/react-components";
import { useTrending } from "../hooks/useWidgets";
import type { Resource } from "../types";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingHorizontalS,
    },
    card: {
        padding: tokens.spacingHorizontalM,
        cursor: "pointer",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    rank: {
        fontWeight: "var(--font-weight-semibold)",
        color: tokens.colorBrandForeground1,
        minWidth: "24px",
    },
    meta: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        alignItems: "center",
    },
});

interface TrendingResourcesProps {
    limit?: number;
}

/**
 * Shows trending resources across the platform, ranked by recent activity.
 * Spec ref: F2.18.
 */
export function TrendingResources({ limit = 5 }: TrendingResourcesProps) {
    const styles = useStyles();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data, isLoading, isError } = useTrending(limit);

    const items: Resource[] = data ?? [];

    return (
        <section className={styles.root} aria-label={t("trendingResources.sectionLabel")}>
            <Title3 as="h3">{t("trendingResources.title")}</Title3>
            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner size="tiny" label={t("common.loading")} />
                </div>
            )}
            {isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("trendingResources.loadError")}</MessageBarBody>
                </MessageBar>
            )}
            {!isLoading && items.length === 0 && (
                <Caption1>{t("trendingResources.empty")}</Caption1>
            )}
            <div className={styles.list}>
                {items.map((resource, index) => (
                    <Card
                        key={resource.id}
                        className={styles.card}
                        onClick={() => navigate(`/resources/${resource.id}`)}
                    >
                        <div className={styles.row}>
                            <div className={styles.row}>
                                <span className={styles.rank}>#{index + 1}</span>
                                <Subtitle2>{resource.title}</Subtitle2>
                            </div>
                            <Badge appearance="tint" size="small">
                                {resource.category?.replace("_", " ") ?? t("resourceMeta.general")}
                            </Badge>
                        </div>
                        <div className={styles.meta}>
                            <Caption1>
                                {t("resourceMeta.by", {
                                    author: resource.authorName ?? resource.userName ?? t("resourceMeta.unknown"),
                                })}
                            </Caption1>
                            <Caption1>·</Caption1>
                            <Caption1>
                                {t("resourceMeta.upvotes", { count: resource.upvoteCount ?? 0 })}
                            </Caption1>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export default TrendingResources;
