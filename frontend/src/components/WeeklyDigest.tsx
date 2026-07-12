import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUp24Regular, Sparkle24Regular } from "@fluentui/react-icons";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { AnimatedCounter } from "./AnimatedCounter";
import styles from "./WeeklyDigest.module.css";

interface DigestPost {
    id: number;
    title: string;
    authorName: string;
    upvoteCount: number;
    href: string;
}

const MOCK_DIGEST: DigestPost[] = [
    {
        id: 1,
        title: "Weekly problem set: combinatorics walkthrough",
        authorName: "Priya",
        upvoteCount: 42,
        href: "/channels/1/threads/1",
    },
    {
        id: 2,
        title: "How I memorized 500 kanji in a month",
        authorName: "Kenji",
        upvoteCount: 31,
        href: "/channels/2/threads/5",
    },
    {
        id: 3,
        title: "Free physics lab notebook template",
        authorName: "Mara",
        upvoteCount: 27,
        href: "/channels/3/threads/8",
    },
];

/**
 * Weekly digest card (F49). Shows the week's top posts sorted by upvotes.
 * Uses mock data until the `/api/posts?sort=weekly` contract is defined; the
 * shape matches what the backend would return so swapping the source is a
 * one-line change.
 *
 * Spec ref: F49.
 */
export function WeeklyDigest() {
    const { t } = useTranslation();
    const posts = MOCK_DIGEST;

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon} aria-hidden="true">
                    <Sparkle24Regular />
                </span>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>
                        {t("weeklyDigest.title", "Weekly Digest")}
                    </h2>
                    <p className={styles.subtitle}>
                        {t("weeklyDigest.subtitle", "Top posts from this week, by upvotes.")}
                    </p>
                </div>
            </div>

            <ol className={styles.list}>
                {posts.map((post, index) => (
                    <li key={post.id} className={styles.item}>
                        <span className={styles.rank}>{index + 1}</span>
                        <div className={styles.itemBody}>
                            <Link to={post.href} className={styles.link}>
                                {post.title}
                            </Link>
                            <span className={styles.author}>
                                {t("common.byAuthor", {
                                    author: post.authorName,
                                    defaultValue: `by ${post.authorName}`,
                                })}
                            </span>
                        </div>
                        <Badge variant="accent" size="small" icon={<ArrowUp24Regular />}>
                            <AnimatedCounter value={post.upvoteCount} />
                        </Badge>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

export default WeeklyDigest;
