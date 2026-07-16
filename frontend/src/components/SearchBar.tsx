import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Input,
    makeStyles,
    tokens,
    Spinner,
    Body1,
    Caption1,
    Badge,
} from "@fluentui/react-components";
import { Search24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";
import type { SearchResult } from "../hooks/useSearch";

const useStyles = makeStyles({
    root: {
        position: "relative",
        width: "100%",
        minWidth: "280px",
    },
    dropdown: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: tokens.spacingVerticalXXS,
        background: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow16,
        zIndex: "var(--z-dropdown)",
        maxHeight: "360px",
        overflowY: "auto",
    },
    resultItem: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXXS,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        cursor: "pointer",
        "&:hover": {
            background: tokens.colorNeutralBackground1Hover,
        },
        "&:focus": {
            background: tokens.colorNeutralBackground1Selected,
            outline: "none",
        },
    },
    resultTop: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        justifyContent: "space-between",
    },
    empty: {
        padding: tokens.spacingHorizontalM,
        color: tokens.colorNeutralForeground3,
    },
    clearBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-0)",
        border: "none",
        borderRadius: tokens.borderRadiusSmall,
        backgroundColor: "transparent",
        color: tokens.colorNeutralForeground3,
        cursor: "pointer",
        minWidth: "20px",
        minHeight: "20px",
        "&:hover": {
            color: tokens.colorNeutralForeground1,
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
        "&:focus-visible": {
            outline: `2px solid ${tokens.colorBrandStroke1}`,
            outlineOffset: "1px",
        },
    },
});

interface SearchBarProps {
    placeholder?: string;
    debounceMs?: number;
    onNavigate?: () => void;
}

/**
 * Global search input with debounce and a results dropdown. Selecting a
 * result navigates to its URL via react-router.
 *
 * Spec ref: F2.13.
 */
export function SearchBar({
    placeholder,
    debounceMs = 250,
    onNavigate,
}: SearchBarProps) {
    const { t } = useTranslation();
    const styles = useStyles();
    const resolvedPlaceholder = placeholder ?? t("search.placeholder");
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, debounceMs);
    const { data, isFetching } = useSearch(debouncedQuery);

    const results: SearchResult[] = data?.content ?? [];

    // Close dropdown when clicking outside.
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const handleSelect = (result: SearchResult) => {
        setOpen(false);
        setQuery("");
        onNavigate?.();
        navigate(result.url);
    };

    const showDropdown = open && query.trim().length > 0;

    return (
        <div className={styles.root} ref={rootRef}>
            <Input
                value={query}
                onChange={(_e, data) => {
                    setQuery(data.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={resolvedPlaceholder}
                contentBefore={<Search24Regular />}
                contentAfter={
                    query ? (
                        <button
                            type="button"
                            className={styles.clearBtn}
                            aria-label={t("search.clear")}
                            onClick={() => {
                                setQuery("");
                                setOpen(false);
                            }}
                        >
                            <Dismiss24Regular />
                        </button>
                    ) : isFetching ? (
                        <span role="status" aria-live="polite" aria-label={t("common.loading")}>
                            <Spinner size="tiny" aria-hidden="true" />
                        </span>
                    ) : null
                }
                aria-label={t("search.ariaLabel")}
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
                aria-controls="search-results"
                role="combobox"
            />

            {showDropdown && (
                <div className={styles.dropdown} id="search-results" role="listbox">
                    {isFetching && results.length === 0 && (
                        <div className={styles.empty}>{t("search.searching")}</div>
                    )}
                    {!isFetching && results.length === 0 && (
                        <div className={styles.empty}>
                            {t("search.noResults", { query: debouncedQuery })}
                        </div>
                    )}
                    {results.map((result) => (
                        <div
                            key={`${result.type}-${result.id}`}
                            className={styles.resultItem}
                            role="option"
                            aria-selected="false"
                            tabIndex={0}
                            onClick={() => handleSelect(result)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelect(result);
                                }
                            }}
                        >
                            <div className={styles.resultTop}>
                                <Body1>{result.title}</Body1>
                                <Badge appearance="tint" size="small">
                                    {result.type}
                                </Badge>
                            </div>
                            {result.snippet && <Caption1>{result.snippet}</Caption1>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
