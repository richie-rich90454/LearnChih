import { useNavigate } from "react-router-dom";
import { Dismiss24Regular, Bookmark24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useBookmarkStore } from "../store/bookmarkStore";
import Seo from "../components/Seo";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import styles from "./List.module.css";

export default function BookmarksPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const bookmarks = useBookmarkStore((s) => s.bookmarks);
    const removeBookmark = useBookmarkStore((s) => s.removeBookmark);

    const items = Object.values(bookmarks).sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );

    return (
        <main className={`${styles.page} ${styles.pageNarrow}`}>
            <Seo
                title={`${t("bookmarks.title")} — LernChih`}
                description={t("bookmarks.description")}
                canonicalPath="/bookmarks"
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>{t("bookmarks.title")}</h1>
            </header>
            {items.length === 0 ? (
                <EmptyState
                    icon={<Bookmark24Regular />}
                    title={t("empty.bookmarksTitle")}
                    description={t("empty.bookmarksDescription")}
                    action={
                        <Button variant="primary" onClick={() => navigate("/resources")}>
                            {t("empty.bookmarksAction")}
                        </Button>
                    }
                />
            ) : (
            <div className={styles.list}>
                {items.map((item) => (
                    <Card
                        key={item.resourceId}
                        className={`${styles.item} ${styles.itemRow} ${styles.itemClickable}`}
                        padding="md"
                        onClick={() => navigate(`/resources/${item.resourceId}`)}
                    >
                        <div>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                            <Badge variant="neutral" size="small">
                                {t("bookmarks.resource", { id: item.resourceId })}
                            </Badge>
                        </div>
                        <Button
                            variant="subtle"
                            size="small"
                            icon={<Dismiss24Regular />}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(item.resourceId);
                            }}
                            aria-label={t("bookmarks.remove")}
                        />
                    </Card>
                ))}
            </div>
            )}
        </main>
    );
}
