import { useTranslation } from "react-i18next";
import { Switch } from "@fluentui/react-components";
import { Search24Regular, Delete24Regular, MailAlert24Regular } from "@fluentui/react-icons";
import {
    useSavedSearches,
    useUpdateSavedSearch,
    useDeleteSavedSearch,
} from "@/hooks/useSavedSearches";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@fluentui/react-components";
import styles from "./SavedSearches.module.css";

interface SavedSearchesProps {
    /** Called when the user clicks a saved search to re-run it. */
    onRun: (query: string) => void;
    /** Highlight the query string currently in the search box. */
    activeQuery?: string;
}

/**
 * Sidebar list of the current user's saved searches (F34). Each row can be
 * re-run, toggled for email alerts, or deleted.
 */
export function SavedSearches({ onRun, activeQuery }: SavedSearchesProps) {
    const { t } = useTranslation();
    const { data, isLoading } = useSavedSearches();
    const update = useUpdateSavedSearch();
    const remove = useDeleteSavedSearch();

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner size="tiny" />
            </div>
        );
    }

    const searches = data ?? [];

    if (searches.length === 0) {
        return null;
    }

    return (
        <Card padding="md" className={styles.panel}>
            <div className={styles.header}>
                <Search24Regular className={styles.headerIcon} />
                <h2 className={styles.title}>{t("savedSearches.title")}</h2>
            </div>
            <ul className={styles.list}>
                {searches.map((s) => {
                    const isActive =
                        !!activeQuery &&
                        s.query.trim().toLowerCase() === activeQuery.trim().toLowerCase();
                    return (
                        <li
                            key={s.id}
                            className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                        >
                            <button
                                type="button"
                                className={styles.runButton}
                                onClick={() => onRun(s.query)}
                                title={t("savedSearches.run", { name: s.name })}
                            >
                                <span className={styles.name}>{s.name}</span>
                                <span className={styles.query}>{s.query}</span>
                            </button>
                            <div className={styles.actions}>
                                <Switch
                                    checked={s.emailAlerts}
                                    onChange={() =>
                                        update.mutate({
                                            id: s.id,
                                            data: { emailAlerts: !s.emailAlerts },
                                        })
                                    }
                                    aria-label={t("savedSearches.emailAlertsLabel")}
                                    title={t("savedSearches.emailAlertsLabel")}
                                />
                                <MailAlert24Regular
                                    className={
                                        s.emailAlerts ? styles.alertOn : styles.alertOff
                                    }
                                />
                                <Button
                                    variant="ghost"
                                    size="small"
                                    icon={<Delete24Regular />}
                                    onClick={() => remove.mutate(s.id)}
                                    aria-label={t("savedSearches.delete")}
                                    title={t("savedSearches.delete")}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

export default SavedSearches;
