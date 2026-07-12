import { Button } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/*
 * Data-table convention (B59): Spec/data tables that use hairline borders
 * become unreadable on narrow mobile viewports. On mobile, render the same
 * rows as a stacked card grid (one Card per row, fields laid out vertically)
 * instead of a hairline `<table>`. Pagination sits below whichever layout is
 * active and uses the design-system `--space-*` tokens for spacing.
 */
/*
 * Spacing convention (B64): The pagination row uses the design-system
 * `--space-2` (8px) gap between controls and `--space-4` (16px) padding
 * around the nav, matching the button-group rhythm (B60) so pagination
 * never drifts from the rest of the layout. Inline styles consume the
 * tokens directly since this is a small, self-contained component.
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;
    return (
        <nav
            aria-label={t("pagination.label")}
            style={{
                display: "flex",
                gap: "var(--space-2)",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-4)",
            }}
        >
            <Button
                appearance="subtle"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label={t("pagination.previous")}
            >
                {t("pagination.previous")}
            </Button>
            <span aria-current="page">
                {t("pagination.pageOf", { current: currentPage, total: totalPages })}
            </span>
            <Button
                appearance="subtle"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label={t("pagination.next")}
            >
                {t("pagination.next")}
            </Button>
        </nav>
    );
}
