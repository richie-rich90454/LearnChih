import { useNavigate } from "react-router-dom";
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
    const { data, isLoading, isError } = useRelatedResources(resourceId);

    const items: Resource[] = (data ?? []).slice(0, limit);

    return (
        <section className={styles.root} aria-label="Related resources">
            <Title3 as="h3">Related resources</Title3>
            {isLoading && <Spinner size="tiny" label="Loading..." />}
            {isError && (
                <MessageBar intent="error">
                    <MessageBarBody>Failed to load related resources.</MessageBarBody>
                </MessageBar>
            )}
            {!isLoading && items.length === 0 && <Caption1>No related resources found.</Caption1>}
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
                                {resource.category?.replace("_", " ") ?? "General"}
                            </Badge>
                        </div>
                        <div className={styles.meta}>
                            <Caption1>
                                by {resource.authorName ?? resource.userName ?? "Unknown"}
                            </Caption1>
                            <Caption1>·</Caption1>
                            <Caption1>{resource.upvoteCount ?? 0} upvotes</Caption1>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export default RelatedResources;
