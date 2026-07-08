import { Avatar } from "@fluentui/react-components";
import { Trophy24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useLeaderboard } from "../hooks/useResources";
import type { LeaderboardEntry } from "../types";
import Seo from "../components/Seo";
import { StaggerReveal } from "../components/StaggerReveal";
import { SkeletonLine, SkeletonList } from "../components/Skeleton";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import styles from "./List.module.css";

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const { data, isLoading, isError, refetch } = useLeaderboard();

    if (isLoading) {
        return (
            <main className={`${styles.page} ${styles.pageNarrow}`}>
                <SkeletonLine width="40%" />
                <SkeletonList count={5} />
            </main>
        );
    }
    if (isError) {
        return (
            <main className={`${styles.page} ${styles.pageNarrow}`}>
                <Seo
                    title={`${t("leaderboard.title")} — LernChih`}
                    description={t("leaderboard.description")}
                    canonicalPath="/leaderboard"
                    hreflang
                />
                <ErrorState
                    icon={<Trophy24Regular />}
                    title={t("error.leaderboardTitle")}
                    description={t("error.leaderboardDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            </main>
        );
    }

    const users: LeaderboardEntry[] = Array.isArray(data) ? data : (data as any)?.content || [];
    const ranked = users.slice(0, 50);

    return (
        <main className={`${styles.page} ${styles.pageNarrow}`}>
            <Seo
                title={`${t("leaderboard.title")} — LernChih`}
                description={t("leaderboard.description")}
                canonicalPath="/leaderboard"
                hreflang
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon} aria-hidden="true">
                        <Trophy24Regular />
                    </span>
                    <h1 className={styles.title}>{t("leaderboard.title")}</h1>
                </div>
            </header>

            {users.length === 0 ? (
                <EmptyState
                    icon={<Trophy24Regular />}
                    title={t("empty.leaderboardTitle")}
                    description={t("empty.leaderboardDescription")}
                />
            ) : (
                <>
                    {/* Desktop: semantic table with sticky first column (B17). */}
                    <StaggerReveal>
                        <div className={styles.tableWrap} role="region" aria-label={t("leaderboard.title")} tabIndex={0}>
                            <table className={styles.table}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th scope="col">{t("leaderboard.rank")}</th>
                                        <th scope="col">{t("leaderboard.user")}</th>
                                        <th scope="col">{t("leaderboard.credits")}</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tableBody}>
                                    {ranked.map((item, i) => {
                                        const rank = i + 1;
                                        return (
                                            <tr key={item.userId} className={styles.tableRow}>
                                                <td>
                                                    <span className={styles.rankCell}>
                                                        {rank <= 3 ? (
                                                            <Badge variant="accent" size="medium">
                                                                <AnimatedCounter value={rank} prefix="#" />
                                                            </Badge>
                                                        ) : (
                                                            <AnimatedCounter value={rank} prefix="#" />
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <Avatar
                                                            name={item.name || t("common.user")}
                                                            size={28}
                                                        />
                                                        <span>{item.name || t("common.unknown")}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge variant="accent">
                                                        <AnimatedCounter value={item.credits ?? 0} />
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </StaggerReveal>

                    {/* Mobile: card reflow (B25). Same data, toggled by CSS. */}
                    <div className={styles.tableCards}>
                        {ranked.map((item, i) => {
                            const rank = i + 1;
                            return (
                                <Card key={item.userId} className={styles.item} padding="md">
                                    <div className={styles.itemHeader}>
                                        <div className={styles.userCell}>
                                            <Avatar
                                                name={item.name || t("common.user")}
                                                size={32}
                                            />
                                            <h3 className={styles.itemTitle}>
                                                {item.name || t("common.unknown")}
                                            </h3>
                                        </div>
                                        {rank <= 3 ? (
                                            <Badge variant="accent" size="medium">
                                                <AnimatedCounter value={rank} prefix="#" />
                                            </Badge>
                                        ) : (
                                            <span className={styles.itemMeta}>#{rank}</span>
                                        )}
                                    </div>
                                    <div className={styles.itemMeta}>
                                        <Badge variant="accent">
                                            <AnimatedCounter value={item.credits ?? 0} />{" "}
                                            {t("leaderboard.credits")}
                                        </Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}
