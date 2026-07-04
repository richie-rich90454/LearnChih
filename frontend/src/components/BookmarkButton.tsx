import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { Bookmark24Regular, Bookmark24Filled } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useBookmarks, useToggleBookmark } from "../hooks/useBookmarks";

const useStyles = makeStyles({
    root: {
        // relies on Button sizing
    },
});

interface BookmarkButtonProps {
    resourceId: number;
    /** Override the bookmarked state (otherwise derived from useBookmarks). */
    bookmarked?: boolean;
    appearance?: "primary" | "subtle" | "transparent" | "outline";
    size?: "small" | "medium" | "large";
}

/**
 * Toggles a bookmark on a resource. Reads the current bookmark set to derive
 * the toggled state and optimistically updates via cache invalidation.
 *
 * Spec ref: F2.15.
 */
export function BookmarkButton({
    resourceId,
    bookmarked,
    appearance = "subtle",
    size = "medium",
}: BookmarkButtonProps) {
    const { t } = useTranslation();
    const styles = useStyles();
    const { data: bookmarks } = useBookmarks();
    const toggle = useToggleBookmark();

    const isBookmarked = bookmarked ?? bookmarks?.some((b) => b.resourceId === resourceId) ?? false;

    return (
        <Button
            className={styles.root}
            appearance={appearance}
            size={size}
            icon={isBookmarked ? <Bookmark24Filled /> : <Bookmark24Regular />}
            onClick={() => toggle.mutate({ resourceId, bookmarked: isBookmarked })}
            disabled={toggle.isPending}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? t("common.removeBookmark") : t("common.addBookmark")}
        >
            {isBookmarked ? t("common.saved") : t("common.save")}
        </Button>
    );
}

export default BookmarkButton;
