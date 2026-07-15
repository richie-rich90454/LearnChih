import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner, Tooltip } from "@fluentui/react-components";
import {
    DocumentEdit24Regular,
    ArrowReply24Regular,
    Delete24Regular,
    CalendarClock24Regular,
} from "@fluentui/react-icons";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDraftsInbox } from "../hooks/useDraftsInbox";
import { useDeleteDraft } from "../hooks/useDrafts";
import { ScheduledPublishingCalendar } from "../components/ScheduledPublishingCalendar";
import styles from "./List.module.css";
import pageStyles from "./DraftsInboxPage.module.css";

type FilterType = "ALL" | "NOTE" | "RESOURCE" | "CHANNEL";

const FILTERS: FilterType[] = ["ALL", "NOTE", "RESOURCE", "CHANNEL"];

type ViewType = "inbox" | "scheduled";

export default function DraftsInboxPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: items, isLoading, isError, refetch } = useDraftsInbox();
    const deleteDraft = useDeleteDraft();
    const [filter, setFilter] = useState<FilterType>("ALL");
    const [view, setView] = useState<ViewType>("inbox");

    const filtered = (items ?? []).filter(
        (item) => filter === "ALL" || item.contentType === filter,
    );

    const handleResume = (contentType: string, contentId: number) => {
        if (contentType === "RESOURCE") {
            navigate(`/resources/${contentId}`);
        } else if (contentType === "CHANNEL") {
            navigate("/channels");
        } else {
            navigate("/notes");
        }
    };

    return (
        <div className={`${styles.page} ${styles.pageNarrow}`}>
            <Seo
                title={`${t("draftsInbox.title")} — LernChih`}
                description={t("draftsInbox.description")}
                canonicalPath="/drafts"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <DocumentEdit24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("draftsInbox.title")}</h1>
                        <p className={styles.subtitle}>{t("draftsInbox.subtitle")}</p>
                    </div>
                </div>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.filters}>
                    <button
                        type="button"
                        className={`${styles.chip} ${view === "inbox" ? styles.chipActive : ""}`}
                        onClick={() => setView("inbox")}
                        /* B-ui-187: these chips behave as toggle buttons
                           (one active view at a time). Without aria-pressed,
                           assistive tech announces only "button" with no
                           state, violating WCAG 4.1.2 (Name, Role, Value). */
                        aria-pressed={view === "inbox"}
                    >
                        {t("draftsInbox.title")}
                    </button>
                    <button
                        type="button"
                        className={`${styles.chip} ${view === "scheduled" ? styles.chipActive : ""}`}
                        onClick={() => setView("scheduled")}
                        aria-pressed={view === "scheduled"}
                    >
                        {/* Decorative icon; the visible text label conveys
                            meaning, so hide the icon from screen readers. */}
                        <CalendarClock24Regular aria-hidden="true" />
                        {t("scheduledPublishing.title", "Scheduled")}
                    </button>
                </div>
                {view === "inbox" && (
                    <div className={styles.filters}>
                        <span className={pageStyles.filterLabel}>
                            {t("draftsInbox.filterLabel")}
                        </span>
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                type="button"
                                className={`${styles.chip} ${
                                    filter === f ? styles.chipActive : ""
                                }`}
                                onClick={() => setFilter(f)}
                                aria-pressed={filter === f}
                            >
                                {t(`draftsInbox.filter.${f}`)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {view === "scheduled" ? (
                <ScheduledPublishingCalendar />
            ) : isLoading ? (
                <div className={pageStyles.loading} role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} aria-hidden="true" />
                </div>
            ) : isError ? (
                <ErrorState
                    title={t("draftsInbox.errorTitle")}
                    description={t("draftsInbox.errorDescription")}
                    onRetry={() => refetch()}
                />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<DocumentEdit24Regular />}
                    title={t("draftsInbox.emptyTitle")}
                    description={t("draftsInbox.emptyDescription")}
                />
            ) : (
                <div className={styles.list}>
                    {filtered.map((item) => (
                        <Card
                            key={item.contentId}
                            className={`${styles.item} ${styles.itemRow}`}
                            padding="md"
                        >
                            <div>
                                <h2 className={styles.itemTitle}>
                                    {item.title || t("draftsInbox.untitled")}
                                </h2>
                                <Badge variant="neutral" size="small">
                                    {t(`draftsInbox.filter.${item.contentType}`)}
                                </Badge>
                            </div>
                            <div className={styles.itemActions}>
                                <Button
                                    variant="subtle"
                                    size="small"
                                    icon={<ArrowReply24Regular />}
                                    onClick={() =>
                                        handleResume(item.contentType, item.contentId)
                                    }
                                >
                                    {t("draftsInbox.resume")}
                                </Button>
                                <Tooltip content={t("draftsInbox.delete")} relationship="label">
                                    <Button
                                        variant="subtle"
                                        size="small"
                                        icon={<Delete24Regular />}
                                        onClick={() => deleteDraft.mutate(item.contentId)}
                                        aria-label={t("draftsInbox.delete")}
                                    />
                                </Tooltip>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
