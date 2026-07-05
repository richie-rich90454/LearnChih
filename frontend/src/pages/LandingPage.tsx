import { useNavigate } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Title1,
    Title3,
    Subtitle1,
    Button,
    Card,
} from "@fluentui/react-components";
import {
    Document24Regular,
    Chat24Regular,
    Trophy24Regular,
    ArrowRight24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import Seo from "@/components/Seo";
import { StaggerReveal } from "@/components/StaggerReveal";
import { HoverLift } from "@/components/HoverLift";
import useAuthStore from "@/store/authStore";

const useStyles = makeStyles({
    page: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXXL,
        maxWidth: "960px",
        margin: "0 auto",
    },
    hero: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tokens.spacingVerticalL,
        padding: `${tokens.spacingVerticalXXL} 0`,
    },
    heroActions: {
        display: "flex",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalM,
    },
    features: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    featureCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        cursor: "pointer",
    },
    featureHeader: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
});

export default function LandingPage() {
    const { t } = useTranslation();
    const styles = useStyles();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return (
        <div className={styles.page}>
            <Seo
                title={t("landing.title")}
                description={t("landing.description")}
                canonicalPath="/"
                hreflang
            />

            <section className={styles.hero}>
                <Title1 as="h1">{t("landing.headline")}</Title1>
                <Subtitle1 style={{ color: tokens.colorNeutralForeground2, maxWidth: "640px" }}>
                    {t("landing.subheadline")}
                </Subtitle1>
                <div className={styles.heroActions}>
                    <Button
                        appearance="primary"
                        size="large"
                        icon={<ArrowRight24Regular />}
                        onClick={() => navigate("/resources")}
                    >
                        {t("landing.browseResources")}
                    </Button>
                    {!isAuthenticated() && (
                        <Button appearance="outline" size="large" onClick={() => navigate("/register")}>
                            {t("landing.getStarted")}
                        </Button>
                    )}
                    {isAuthenticated() && (
                        <Button appearance="outline" size="large" onClick={() => navigate("/dashboard")}>
                            {t("landing.goToDashboard")}
                        </Button>
                    )}
                </div>
            </section>

            <section>
                <Title3 as="h2" style={{ marginBottom: tokens.spacingVerticalL }}>
                    {t("landing.explore")}
                </Title3>
                <StaggerReveal className={styles.features}>
                    <HoverLift>
                        <Card
                            className={styles.featureCard}
                            onClick={() => navigate("/resources")}
                        >
                            <div className={styles.featureHeader}>
                                <Document24Regular />
                                <Title3 as="h3">{t("nav.resources")}</Title3>
                            </div>
                            <Subtitle1>{t("landing.resourcesDescription")}</Subtitle1>
                        </Card>
                    </HoverLift>
                    <HoverLift>
                        <Card
                            className={styles.featureCard}
                            onClick={() => navigate("/channels")}
                        >
                            <div className={styles.featureHeader}>
                                <Chat24Regular />
                                <Title3 as="h3">{t("nav.channels")}</Title3>
                            </div>
                            <Subtitle1>{t("landing.channelsDescription")}</Subtitle1>
                        </Card>
                    </HoverLift>
                    <HoverLift>
                        <Card
                            className={styles.featureCard}
                            onClick={() => navigate("/leaderboard")}
                        >
                            <div className={styles.featureHeader}>
                                <Trophy24Regular />
                                <Title3 as="h3">{t("nav.leaderboard")}</Title3>
                            </div>
                            <Subtitle1>{t("landing.leaderboardDescription")}</Subtitle1>
                        </Card>
                    </HoverLift>
                </StaggerReveal>
            </section>
        </div>
    );
}
