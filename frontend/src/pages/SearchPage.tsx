import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spinner } from "@fluentui/react-components";
import { Search24Regular, Save24Regular } from "@fluentui/react-icons";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SavedSearches } from "../components/SavedSearches";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import useAuthStore from "../store/authStore";
import { useCreateSavedSearch, useSavedSearches } from "../hooks/useSavedSearches";
import type { SearchResult } from "../hooks/useSearch";
import styles from "./List.module.css";

export default function SearchPage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get("q") || "");
    const debouncedQuery = useDebounce(query, 250);
    const { data, isFetching, isError, refetch } = useSearch(debouncedQuery);
    const { isAuthenticated } = useAuthStore();
    const authenticated = isAuthenticated();
    const createSavedSearch = useCreateSavedSearch();
    const { data: savedSearches } = useSavedSearches(authenticated);

    const results: SearchResult[] = data?.content ?? [];

    const handleChange = (value: string) => {
        setQuery(value);
        setSearchParams(value ? { q: value } : {}, { replace: true });
    };

    const handleRunSaved = (savedQuery: string) => {
        setQuery(savedQuery);
        setSearchParams({ q: savedQuery }, { replace: true });
    };

    const alreadySaved =
        !!debouncedQuery &&
        (savedSearches ?? []).some(
            (s) => s.query.trim().toLowerCase() === debouncedQuery.trim().toLowerCase(),
        );

    const handleSave = () => {
        if (!debouncedQuery.trim() || alreadySaved || createSavedSearch.isPending) return;
        createSavedSearch.mutate({ query: debouncedQuery.trim() });
    };

    return (
        <div className={`${styles.page} ${styles.pageNarrow}`}>
            <Seo
                title={`${query ? `${query} — ` : ""}${t("search.title")} — LernChih`}
                description={t("search.description")}
                canonicalPath="/search"
                robots="noindex, follow"
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>{t("search.title")}</h1>
                {authenticated && debouncedQuery.trim() && (
                    <Button
                        variant="outline"
                        size="small"
                        icon={<Save24Regular />}
                        onClick={handleSave}
                        disabled={alreadySaved || createSavedSearch.isPending}
                        title={
                            alreadySaved
                                ? t("savedSearches.alreadySaved")
                                : t("savedSearches.saveThisSearch")
                        }
                    >
                        {alreadySaved
                            ? t("savedSearches.alreadySaved")
                            : t("savedSearches.saveThisSearch")}
                    </Button>
                )}
            </header>
            <Input
                value={query}
                onChange={(_e, data) => handleChange(data.value)}
                placeholder={t("search.placeholder")}
                contentBefore={<Search24Regular />}
                wrapperClassName={styles.search}
                aria-label={t("search.placeholder")}
            />

            {isFetching && <Spinner label={t("search.searching")} />}
            {isError && (
                <ErrorState
                    title={t("error.searchTitle")}
                    description={t("error.searchDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}

            {!isFetching && !isError && debouncedQuery && results.length === 0 && (
                <EmptyState
                    icon={<Search24Regular />}
                    title={t("empty.searchTitle")}
                    description={t("empty.searchDescription")}
                />
            )}

            <div className={styles.list}>
                {results.map((result) => (
                    <Card
                        key={`${result.type}-${result.id}`}
                        className={`${styles.item} ${styles.itemClickable}`}
                        padding="md"
                        onClick={() => {
                            // External URLs open in a new tab; internal paths use react-router.
                            if (result.url.startsWith("http")) {
                                window.open(result.url, "_blank", "noopener noreferrer");
                            } else {
                                window.location.href = result.url;
                            }
                        }}
                    >
                        <div className={styles.itemHeader}>
                            <h2 className={styles.itemTitle}>{result.title}</h2>
                            <Badge variant="accent" size="small">
                                {result.type}
                            </Badge>
                        </div>
                        {result.snippet && <p className={styles.itemBody}>{result.snippet}</p>}
                    </Card>
                ))}
            </div>

            {authenticated && (
                <SavedSearches onRun={handleRunSaved} activeQuery={debouncedQuery} />
            )}
        </div>
    );
}
