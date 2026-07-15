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
import { useRelatedResources } from "../hooks/useWidgets";
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
    meta: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        alignItems: "center",
    },
});

interface RelatedResourcesProps {
    resourceId: string | number;
    limit?: number;
}

/**
 * Shows resources related to the given resource.
 * Spec ref: F2.17.
 */
export function RelatedResources({ resourceId, limit = 5 }: RelatedResourcesProps) {
    const styles = useStyles();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data, isLoading, isError } = useRelatedResources(resourceId);

    const items: Resource[] = (data ?? []).slice(0, limit);

    return (
        <section className={styles.root} aria-label={t("relatedResources.sectionLabel")}>
            <Title3 as="h3">{t("relatedResources.title")}</Title3>
            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner size="tiny" label={t("common.loading")} aria-hidden="true" />
                </div>
            )}
            {isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("relatedResources.loadError")}</MessageBarBody>
                </MessageBar>
            )}
            {!isLoading && items.length === 0 && <Caption1>{t("relatedResources.empty")}</Caption1>}
            <div className={styles.list}>
                {items.map((resource) => (
                    <Card
                        key={resource.id}
                        className={styles.card}
                        onClick={() => navigate(`/resources/${resource.id}`)}
                    >
                        <div className={styles.row}>
                            <Subtitle2>{resource.title}</Subtitle2>
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

export default RelatedResources;
