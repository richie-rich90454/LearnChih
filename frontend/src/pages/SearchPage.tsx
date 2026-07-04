import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Title2,
    Body1,
    Card,
    Badge,
    Input,
    Spinner,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import type { SearchResult } from "../hooks/useSearch";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "800px",
    },
    searchRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "center",
    },
    resultCard: {
        padding: tokens.spacingHorizontalM,
        cursor: "pointer",
    },
    resultHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    snippet: {
        color: tokens.colorNeutralForeground3,
        marginTop: tokens.spacingVerticalXS,
    },
});

export default function SearchPage() {
    const { t } = useTranslation();
    const styles = useStyles();
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get("q") || "");
    const debouncedQuery = useDebounce(query, 250);
    const { data, isFetching, isError } = useSearch(debouncedQuery);

    const results: SearchResult[] = data?.content ?? [];

    const handleChange = (value: string) => {
        setQuery(value);
        setSearchParams(value ? { q: value } : {}, { replace: true });
    };

    return (
        <div className={styles.container}>
            <Seo
                title={`${query ? `${query} — ` : ""}${t("search.title")} — LernChih`}
                description={t("search.description")}
                canonicalPath="/search"
                robots="noindex, follow"
            />
            <Title2 as="h1">{t("search.title")}</Title2>
            <div className={styles.searchRow}>
                <Input
                    value={query}
                    onChange={(_e, data) => handleChange(data.value)}
                    placeholder={t("search.placeholder")}
                    contentBefore={<Search24Regular />}
                    style={{ flex: 1 }}
                    aria-label={t("search.placeholder")}
                />
            </div>

            {isFetching && <Spinner label={t("search.searching")} />}
            {isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("search.loadError")}</MessageBarBody>
                </MessageBar>
            )}

            {!isFetching && debouncedQuery && results.length === 0 && (
                <Body1 style={{ color: "var(--colorNeutralForeground3)" }}>
                    {t("search.noResults", { query: debouncedQuery })}
                </Body1>
            )}

            {results.map((result) => (
                <Card
                    key={`${result.type}-${result.id}`}
                    className={styles.resultCard}
                    onClick={() => {
                        // External URLs open in a new tab; internal paths use react-router.
                        if (result.url.startsWith("http")) {
                            window.open(result.url, "_blank", "noopener noreferrer");
                        } else {
                            window.location.href = result.url;
                        }
                    }}
                >
                    <div className={styles.resultHeader}>
                        <Body1>{result.title}</Body1>
                        <Badge appearance="tint" size="small">
                            {result.type}
                        </Badge>
                    </div>
                    {result.snippet && <div className={styles.snippet}>{result.snippet}</div>}
                </Card>
            ))}
        </div>
    );
}
