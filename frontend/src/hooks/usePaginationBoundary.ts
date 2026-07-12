import { useEffect } from "react";

/**
 * Pagination boundary guard (B80).
 *
 * Prevents the "empty last page" UX bug: when the last item on the final page
 * is deleted, the user is left staring at an empty page. This hook watches the
 * data length and, if the current page is now empty but earlier pages still have
 * items, clamps the page back to the last non-empty page.
 *
 * CONVENTION (B80): Every paginated list that uses client-side page state
 * should wrap its page setter with this hook so the view never lands on an
 * empty page after a deletion or filter change.
 *
 * Usage:
 *   const [page, setPage] = useState(1);
 *   usePaginationBoundary({ page, totalItems, pageSize, setPage });
 *
 * @param page - current 1-indexed page number
 * @param totalItems - total number of items across all pages (post-filter)
 * @param pageSize - items per page
 * @param setPage - state setter that updates the current page
 */
export interface UsePaginationBoundaryArgs {
    page: number;
    totalItems: number;
    pageSize: number;
    setPage: (page: number) => void;
}

export function usePaginationBoundary({
    page,
    totalItems,
    pageSize,
    setPage,
}: UsePaginationBoundaryArgs): void {
    useEffect(() => {
        if (page < 1) {
            setPage(1);
            return;
        }
        if (totalItems <= 0) return;

        const lastPage = Math.max(1, Math.ceil(totalItems / pageSize));
        if (page > lastPage) {
            setPage(lastPage);
        }
    }, [page, totalItems, pageSize, setPage]);
}

export default usePaginationBoundary;
