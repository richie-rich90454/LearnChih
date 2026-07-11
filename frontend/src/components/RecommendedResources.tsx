import { useNavigate } from "react-router-dom";
import { makeStyles, tokens, Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Sparkle24Regular, ArrowRight24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useRecommendations } from "../hooks/useRecommendations";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    card: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        cursor: "pointer",
    },
    title: {
        margin: 0,
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
    },
    desc: {
        margin: 0,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase300,
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    meta: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },
    loading: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        color: tokens.colorNeutralForeground3,
    },
});

/**
 * "Recommended for you" section (F23). Shows content-based resource
 * recommendations derived from the user's interaction history.
 */
export function RecommendedResources() {
    const styles = useStyles();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useRecommendations();

    return (
        <section className={styles.root} aria-label={t("recommendations.title")}>
            <div className={styles.header}>
                <Sparkle24Regular aria-hidden />
                <h2>{t("recommendations.title")}</h2>
            </div>

            {isLoading && (
                <div className={styles.loading} role="status" aria-live="polite">
                    <Spinner size="tiny" />
                    <span>{t("recommendations.loading")}</span>
                </div>
            )}

            {isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("recommendations.error")}</MessageBarBody>
                </MessageBar>
            )}

            {!isLoading && !isError && (data?.length ?? 0) === 0 && (
                <EmptyState
                    icon={<Sparkle24Regular />}
                    title={t("recommendations.emptyTitle")}
                    description={t("recommendations.emptyDescription")}
                />
            )}

            {!isLoading && !isError && (data?.length ?? 0) > 0 && (
                <div className={styles.grid}>
                    {data!.map((item) => (
                        <Card
                            key={item.id}
                            interactive
                            padding="md"
                            className={styles.card}
                            onClick={() => navigate(`/resources/${item.id}`)}
                        >
                            <h3 className={styles.title}>{item.title}</h3>
                            {item.description && (
                                <p className={styles.desc}>{item.description}</p>
                            )}
                            <div className={styles.meta}>
                                {item.category && (
                                    <Badge variant="accent" size="small">
                                        {item.category.replace("_", " ")}
                                    </Badge>
                                )}
                                {item.subjectName && (
                                    <Badge variant="neutral" size="small">
                                        {item.subjectName}
                                    </Badge>
                                )}
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<ArrowRight24Regular />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/resources/${item.id}`);
                                    }}
                                >
                                    {t("common.open")}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
