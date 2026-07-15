import { useNavigate } from "react-router-dom";
import {
    Clock24Regular,
    ClipboardTask24Regular,
    Quiz24Regular,
    ArrowRight24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useDueToday } from "@/hooks/useDueToday";
import type { DueItem } from "@/api/dueToday";
import Seo from "@/components/Seo";
import { SkeletonLine, SkeletonList } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./DueTodayPage.module.css";

function itemIcon(type: DueItem["type"]) {
    switch (type) {
        case "FLASHCARD":
            return <ClipboardTask24Regular />;
        case "RESOURCE_REVIEW":
            return <Clock24Regular />;
        case "QUIZ":
            return <Quiz24Regular />;
        default:
            return <Clock24Regular />;
    }
}

function typeLabel(type: DueItem["type"], t: (k: string) => string) {
    switch (type) {
        case "FLASHCARD":
            return t("dueToday.typeFlashcard");
        case "RESOURCE_REVIEW":
            return t("dueToday.typeReview");
        case "QUIZ":
            return t("dueToday.typeQuiz");
        default:
            return "";
    }
}

export default function DueTodayPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, isLoading, isError, refetch } = useDueToday();

    if (isLoading) {
        return (
            <div className={styles.container}>
                <SkeletonLine width="40%" />
                <SkeletonList count={4} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <Seo
                    title={`${t("dueToday.title")} — LernChih`}
                    description={t("dueToday.subtitle")}
                    canonicalPath="/due-today"
                    hreflang
                />
                <h1 className="visually-hidden">{t("dueToday.title")}</h1>
                <ErrorState
                    title={t("dueToday.errorTitle")}
                    description={t("dueToday.errorDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            </div>
        );
    }

    const items = data?.items ?? [];

    return (
        <div className={styles.container}>
            <Seo
                title={`${t("dueToday.title")} — LernChih`}
                description={t("dueToday.subtitle")}
                canonicalPath="/due-today"
                hreflang
            />
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{t("dueToday.title")}</h1>
                    {items.length > 0 && (
                        <Badge variant="accent">{items.length}</Badge>
                    )}
                </div>
                <p className={styles.subtitle}>{t("dueToday.subtitle")}</p>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon={<Clock24Regular />}
                    title={t("dueToday.emptyTitle")}
                    description={t("dueToday.emptyDescription")}
                />
            ) : (
                <div className={styles.itemList}>
                    {items.map((item) => (
                        <Card
                            key={`${item.type}-${item.id}`}
                            interactive
                            padding="md"
                            className={styles.itemCard}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(item.destination)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    navigate(item.destination);
                                }
                            }}
                        >
                            <span className={styles.itemIcon} aria-hidden>
                                {itemIcon(item.type)}
                            </span>
                            <div className={styles.itemBody}>
                                <h2 className={styles.itemTitle}>{item.title}</h2>
                                <p className={styles.itemSubtitle}>{item.subtitle}</p>
                            </div>
                            <Badge variant="neutral" size="small">
                                {typeLabel(item.type, t)}
                            </Badge>
                            <span className={styles.itemAction}>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<ArrowRight24Regular />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(item.destination);
                                    }}
                                >
                                    {t("common.open")}
                                </Button>
                            </span>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
