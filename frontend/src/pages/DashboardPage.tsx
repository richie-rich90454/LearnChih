import { useNavigate } from "react-router-dom";
import {
    Document24Regular,
    Chat24Regular,
    Trophy24Regular,
    ArrowRight24Regular,
} from "@fluentui/react-icons";
import useAuthStore from "@/store/authStore";
import { useMyProfile } from "@/hooks/useProfile";
import { useResources } from "@/hooks/useResources";
import { useTranslation } from "react-i18next";
import type { Resource } from "@/types";
import Seo from "@/components/Seo";
import { SkeletonLine, SkeletonList } from "@/components/Skeleton";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { StaggerReveal } from "@/components/StaggerReveal";
import { HoverLift } from "@/components/HoverLift";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResumeCard } from "@/components/ResumeCard";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const {
        data: profile,
        isLoading: profileLoading,
        isError: profileError,
        refetch: refetchProfile,
    } = useMyProfile();
    const {
        data: resources,
        isLoading: resourcesLoading,
        isError: resourcesError,
        refetch: refetchResources,
    } = useResources({ page: "0", size: "6" });

    if (profileLoading || resourcesLoading) {
        return (
            <div className={styles.container}>
                <SkeletonLine width="40%" />
                <div className={styles.statsRow}>
                    <Card padding="lg" className={styles.statCard}>
                        <SkeletonLine width="50%" />
                        <SkeletonLine />
                    </Card>
                    <Card padding="lg" className={styles.statCard}>
                        <SkeletonLine width="50%" />
                        <SkeletonLine />
                    </Card>
                    <Card padding="lg" className={styles.statCard}>
                        <SkeletonLine width="50%" />
                        <SkeletonLine />
                    </Card>
                </div>
                <SkeletonList count={3} />
            </div>
        );
    }

    if (profileError || resourcesError) {
        return (
            <div className={styles.container}>
                <Seo
                    title={`${t("nav.dashboard")} — LernChih`}
                    description={t("dashboard.description")}
                    canonicalPath="/"
                    hreflang
                />
                <ErrorState
                    title={t("error.dashboardTitle")}
                    description={t("error.dashboardDescription")}
                    onRetry={() => {
                        refetchProfile();
                        refetchResources();
                    }}
                    retryLabel={t("error.tryAgain")}
                />
            </div>
        );
    }

    const recentResources: Resource[] = Array.isArray(resources)
        ? resources.slice(0, 6)
        : (resources as any)?.content?.slice(0, 6) || [];

    return (
        <div className={styles.container}>
            <Seo
                title={`${t("nav.dashboard")} — LernChih`}
                description={t("dashboard.description")}
                canonicalPath="/"
                hreflang
            />
            {/* Welcome */}
            <div>
                <h1 className={styles.welcomeTitle}>
                    {t("dashboard.welcome", { name: user?.name || t("common.student") })}
                </h1>
                <p className={styles.welcomeSubtitle}>{t("dashboard.subtitle")}</p>
            </div>

            {/* Continue where you left off */}
            <ResumeCard />

            {/* Onboarding checklist */}
            <OnboardingChecklist />

            {/* Quick stats */}
            <div className={styles.statsRow}>
                <Card padding="lg" className={styles.statCard}>
                    <p className={styles.statLabel}>{t("dashboard.credits")}</p>
                    <div className={styles.statValue}>
                        <AnimatedCounter value={profile?.credits ?? 0} />
                        <Badge variant="accent">{t("dashboard.points")}</Badge>
                    </div>
                </Card>
                <Card padding="lg" className={styles.statCard}>
                    <p className={styles.statLabel}>{t("dashboard.resourcesUploaded")}</p>
                    <div className={styles.statValue}>
                        <AnimatedCounter value={profile?.resourceCount ?? 0} />
                    </div>
                </Card>
                <Card padding="lg" className={styles.statCard}>
                    <p className={styles.statLabel}>{t("dashboard.upvotesReceived")}</p>
                    <div className={styles.statValue}>
                        <AnimatedCounter value={profile?.upvoteCount ?? 0} />
                    </div>
                </Card>
            </div>

            {/* Quick links */}
            <div>
                <h2 className={styles.sectionTitle}>{t("dashboard.quickLinks")}</h2>
                <StaggerReveal className={styles.quickLinks}>
                    <HoverLift>
                        <Card
                            interactive
                            padding="md"
                            className={styles.quickLinkCard}
                            onClick={() => navigate("/resources")}
                        >
                            <div className={styles.quickLinkLeft}>
                                <span className={styles.quickLinkIcon}>
                                    <Document24Regular />
                                </span>
                                <span className={styles.quickLinkLabel}>{t("nav.resources")}</span>
                            </div>
                            <span className={styles.quickLinkArrow}>
                                <ArrowRight24Regular />
                            </span>
                        </Card>
                    </HoverLift>
                    <HoverLift>
                        <Card
                            interactive
                            padding="md"
                            className={styles.quickLinkCard}
                            onClick={() => navigate("/channels")}
                        >
                            <div className={styles.quickLinkLeft}>
                                <span className={styles.quickLinkIcon}>
                                    <Chat24Regular />
                                </span>
                                <span className={styles.quickLinkLabel}>{t("nav.channels")}</span>
                            </div>
                            <span className={styles.quickLinkArrow}>
                                <ArrowRight24Regular />
                            </span>
                        </Card>
                    </HoverLift>
                    <HoverLift>
                        <Card
                            interactive
                            padding="md"
                            className={styles.quickLinkCard}
                            onClick={() => navigate("/leaderboard")}
                        >
                            <div className={styles.quickLinkLeft}>
                                <span className={styles.quickLinkIcon}>
                                    <Trophy24Regular />
                                </span>
                                <span className={styles.quickLinkLabel}>
                                    {t("nav.leaderboard")}
                                </span>
                            </div>
                            <span className={styles.quickLinkArrow}>
                                <ArrowRight24Regular />
                            </span>
                        </Card>
                    </HoverLift>
                </StaggerReveal>
            </div>

            {/* Recent resources */}
            <div>
                <h2 className={styles.sectionTitle}>{t("dashboard.recentResources")}</h2>
                {recentResources.length === 0 ? (
                    <EmptyState
                        icon={<Document24Regular />}
                        title={t("empty.dashboardTitle")}
                        description={t("empty.dashboardDescription")}
                        action={
                            <Button
                                variant="primary"
                                icon={<ArrowRight24Regular />}
                                onClick={() => navigate("/resources")}
                            >
                                {t("empty.bookmarksAction")}
                            </Button>
                        }
                    />
                ) : (
                    <StaggerReveal className={styles.recentGrid}>
                        {recentResources.map((resource) => (
                            <HoverLift key={resource.id}>
                                <Card
                                    interactive
                                    padding="md"
                                    className={styles.resourceCard}
                                    onClick={() => navigate(`/resources/${resource.id}`)}
                                >
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.resourceTitle}>{resource.title}</h3>
                                        <Badge variant="neutral" size="small">
                                            {resource.category || t("resources.general")}
                                        </Badge>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardMetaText}>
                                            {t("common.byAuthor", {
                                                author: resource.authorName || t("common.unknown"),
                                            })}
                                        </span>
                                        <Badge variant="neutral" size="small">
                                            <AnimatedCounter
                                                value={resource.upvoteCount ?? 0}
                                                suffix={` ${t("resources.upvotes")}`}
                                            />
                                        </Badge>
                                    </div>
                                </Card>
                            </HoverLift>
                        ))}
                    </StaggerReveal>
                )}
            </div>
        </div>
    );
}
