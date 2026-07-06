import { type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Title1,
    Title2,
    Subtitle1,
    Subtitle2,
    Button,
} from "@fluentui/react-components";
import {
    Document24Regular,
    Chat24Regular,
    Trophy24Regular,
    SlideLayout24Regular,
    PeopleTeam24Regular,
    ArrowRight24Regular,
    Clock24Regular,
} from "@fluentui/react-icons";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import Seo from "@/components/Seo";
import { MagneticButton } from "@/components/MagneticButton";
import { LogoWall } from "@/components/LogoWall";
import { LogoMarkAnimated } from "@/components/Logo";
import { StickyScrollStack, type StickyScrollCard } from "@/components/StickyScrollStack";
import useAuthStore from "@/store/authStore";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.6;

const useStyles = makeStyles({
    page: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
    },

    /* ---- Hero (asymmetric split) ---- */
    hero: {
        minHeight: "calc(100dvh - 72px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        gap: tokens.spacingHorizontalXXL,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "96px 0 64px",
        width: "100%",
        "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
            gap: tokens.spacingVerticalXL,
            padding: "64px 0 48px",
        },
    },
    heroLeft: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tokens.spacingVerticalL,
        maxWidth: "640px",
    },
    eyebrow: {
        // Concrete cobalt instead of tokens.colorBrandForeground1 so
        // axe-core can evaluate contrast without resolving CSS variables.
        color: "#1E4FD8",
        fontWeight: 600,
        fontSize: "14px",
        letterSpacing: "0.01em",
        "@media (prefers-color-scheme: dark)": {
            color: "#5B8DEF",
        },
    },
    headline: {
        fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        margin: 0,
        // Concrete color for axe-core; dark mode override.
        color: "#242424",
        "@media (prefers-color-scheme: dark)": {
            color: "#FFFFFF",
        },
    },
    subtext: {
        // Concrete color instead of tokens.colorNeutralForeground2.
        color: "#424242",
        maxWidth: "640px",
        "@media (prefers-color-scheme: dark)": {
            color: "#FFFFFF",
        },
    },
    heroActions: {
        display: "flex",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalM,
    },
    heroRight: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    heroImage: {
        width: "100%",
        maxWidth: "560px",
        height: "auto",
        maxHeight: "70vh",
        borderRadius: "var(--radius-card)",
        boxShadow: "0 24px 48px rgba(0, 0, 0, 0.18)",
        objectFit: "cover",
    },

    /* ---- Section containers ---- */
    contained: {
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
    },
    sectionSpacer: {
        paddingTop: tokens.spacingVerticalXXL,
    },

    /* ---- Bento grid ---- */
    bentoSection: {
        padding: `${tokens.spacingVerticalXXL} 0`,
    },
    bentoHeading: {
        marginBottom: tokens.spacingVerticalL,
        // Concrete color for axe-core; dark mode override.
        color: "#242424",
        "@media (prefers-color-scheme: dark)": {
            color: "#FFFFFF",
        },
    },
    bento: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: tokens.spacingHorizontalM,
        "@media (min-width: 900px)": {
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "minmax(180px, auto)",
        },
    },
    cell: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingHorizontalL,
        borderRadius: "var(--radius-card)",
        textAlign: "left",
        cursor: "pointer",
        minHeight: "160px",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        // Concrete background for axe-core; dark mode override.
        backgroundColor: "#FFFFFF",
        transition: `box-shadow var(--motion-base) var(--motion-ease)`,
        ":hover": {
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
        },
        ":focus-visible": {
            outline: `2px solid ${tokens.colorBrandStroke1}`,
            outlineOffset: "2px",
        },
        "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#242424",
            border: `1px solid #3D3D3D`,
        },
    },
    cellIcon: {
        // Concrete cobalt instead of tokens.colorBrandForeground1.
        color: "#1E4FD8",
        display: "inline-flex",
        "@media (prefers-color-scheme: dark)": {
            color: "#5B8DEF",
        },
    },
    cellFeature: {
        backgroundColor: "#1E4FD8",
        backgroundImage:
            "linear-gradient(135deg, #1E4FD8 0%, #4A78E5 100%)",
        color: "#FFFFFF",
        border: "none",
        justifyContent: "space-between",
        minHeight: "360px",
        ":hover": {
            boxShadow: "0 20px 40px rgba(30, 79, 216, 0.35)",
        },
        "@media (min-width: 900px)": {
            gridColumn: "1 / 3",
            gridRow: "1 / 3",
        },
    },
    cellChannels: {
        "@media (min-width: 900px)": {
            gridColumn: "3 / 4",
            gridRow: "1 / 2",
        },
    },
    cellLeaderboard: {
        backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
        "@media (min-width: 900px)": {
            gridColumn: "3 / 4",
            gridRow: "2 / 3",
        },
    },
    cellTools: {
        "@media (min-width: 900px)": {
            gridColumn: "1 / 3",
            gridRow: "3 / 4",
        },
    },
    cellGroups: {
        "@media (min-width: 900px)": {
            gridColumn: "3 / 4",
            gridRow: "3 / 4",
        },
    },

    /* ---- CTA band ---- */
    ctaBand: {
        margin: `${tokens.spacingVerticalXXL} 0 0`,
        padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXL}`,
        backgroundImage: "linear-gradient(135deg, #0E3BC4 0%, #1E4FD8 100%)",
        backgroundColor: "#1E4FD8",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalL,
        textAlign: "center",
        borderRadius: "var(--radius-card)",
        "@media (max-width: 768px)": {
            padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
        },
    },
});

interface BentoCell {
    key: string;
    title: string;
    description: string;
    icon: typeof Document24Regular;
    route: string;
    className: string;
    feature?: boolean;
}

export default function LandingPage() {
    const { t } = useTranslation();
    const styles = useStyles();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const reduce = useReducedMotion() ?? false;
    const authed = isAuthenticated();

    const stickyCards: StickyScrollCard[] = [
        {
            title: t("landing.stickyCard1Title"),
            description: t("landing.stickyCard1Description"),
            icon: <Clock24Regular />,
        },
        {
            title: t("landing.stickyCard2Title"),
            description: t("landing.stickyCard2Description"),
            icon: <Chat24Regular />,
        },
        {
            title: t("landing.stickyCard3Title"),
            description: t("landing.stickyCard3Description"),
            icon: <Trophy24Regular />,
        },
    ];

    const bentoCells: BentoCell[] = [
        {
            key: "resources",
            title: t("landing.bentoResourcesTitle"),
            description: t("landing.bentoResourcesDescription"),
            icon: Document24Regular,
            route: "/resources",
            className: styles.cellFeature,
            feature: true,
        },
        {
            key: "channels",
            title: t("landing.bentoChannelsTitle"),
            description: t("landing.bentoChannelsDescription"),
            icon: Chat24Regular,
            route: "/channels",
            className: styles.cellChannels,
        },
        {
            key: "leaderboard",
            title: t("landing.bentoLeaderboardTitle"),
            description: t("landing.bentoLeaderboardDescription"),
            icon: Trophy24Regular,
            route: "/leaderboard",
            className: styles.cellLeaderboard,
        },
        {
            key: "tools",
            title: t("landing.bentoToolsTitle"),
            description: t("landing.bentoToolsDescription"),
            icon: SlideLayout24Regular,
            route: "/flashcards",
            className: styles.cellTools,
        },
        {
            key: "groups",
            title: t("landing.bentoGroupsTitle"),
            description: t("landing.bentoGroupsDescription"),
            icon: PeopleTeam24Regular,
            route: "/study-groups",
            className: styles.cellGroups,
        },
    ];

    const onCellKey = (route: string) => (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(route);
        }
    };

    return (
        <div className={styles.page}>
            <Seo
                title={t("landing.title")}
                description={t("landing.description")}
                canonicalPath="/"
                hreflang
            />

            {/* Section 1: Asymmetric split hero */}
            <section className={styles.hero} aria-label={t("landing.title")}>
                <div className={styles.heroLeft}>
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0 }}
                    >
                        <LogoMarkAnimated size={48} title="LernChih" />
                    </motion.div>
                    <motion.span
                        className={styles.eyebrow}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0 }}
                    >
                        {t("landing.eyebrow")}
                    </motion.span>
                    <motion.h1
                        className={styles.headline}
                        initial={reduce ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0.12 }}
                    >
                        {t("landing.headline")}
                    </motion.h1>
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0.28 }}
                    >
                        <Subtitle1 as="p" className={styles.subtext}>
                            {t("landing.subheadline")}
                        </Subtitle1>
                    </motion.div>
                    <motion.div
                        className={styles.heroActions}
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0.44 }}
                    >
                        <MagneticButton>
                            <Button
                                appearance="primary"
                                size="large"
                                icon={<ArrowRight24Regular />}
                                onClick={() => navigate("/resources")}
                            >
                                {t("landing.browseResources")}
                            </Button>
                        </MagneticButton>
                        <Button
                            appearance="outline"
                            size="large"
                            onClick={() => navigate("/channels")}
                        >
                            {t("landing.exploreChannels")}
                        </Button>
                    </motion.div>
                </div>
                <motion.div
                    className={styles.heroRight}
                    initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: DURATION, ease: EASE, delay: 0.2 }}
                >
                    <img
                        className={styles.heroImage}
                        src="/hero.png"
                        alt=""
                        fetchPriority="high"
                        width={800}
                        height={600}
                    />
                </motion.div>
            </section>

            {/* Section 2: Logo wall (under hero, not inside it) */}
            <div className={styles.contained}>
                <LogoWall />
            </div>

            {/* Section 3: Bento feature grid */}
            <section className={`${styles.contained} ${styles.bentoSection}`}>
                <Title2 as="h2" className={styles.bentoHeading}>
                    {t("landing.bentoHeading")}
                </Title2>
                <div className={styles.bento}>
                    {bentoCells.map((cell, i) => {
                        const Icon = cell.icon;
                        return (
                            <motion.div
                                key={cell.key}
                                className={`${styles.cell} ${cell.className}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(cell.route)}
                                onKeyDown={onCellKey(cell.route)}
                                initial={reduce ? false : { opacity: 0, y: 24 }}
                                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                                whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18, ease: EASE } }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.5,
                                    ease: EASE,
                                    delay: i * 0.06,
                                }}
                            >
                                <span
                                    className={styles.cellIcon}
                                    style={cell.feature ? { color: "#FFFFFF" } : undefined}
                                >
                                    <Icon />
                                </span>
                                <Title2
                                    as="h3"
                                    style={cell.feature ? { color: "#FFFFFF" } : { color: "#242424" }}
                                >
                                    {cell.title}
                                </Title2>
                                <Subtitle2
                                    style={
                                        cell.feature
                                            ? { color: "rgba(255, 255, 255, 0.85)" }
                                            : { color: "#424242" }
                                    }
                                >
                                    {cell.description}
                                </Subtitle2>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Section 4: Sticky-scroll feature stack */}
            <section className={styles.sectionSpacer}>
                <StickyScrollStack cards={stickyCards} />
            </section>

            {/* Section 5: Full-width CTA band */}
            <section className={`${styles.contained} ${styles.sectionSpacer}`}>
                <div className={styles.ctaBand}>
                    <Title1
                        as="h2"
                        style={{
                            color: "#FFFFFF",
                            margin: 0,
                            backgroundColor: "#1E4FD8",
                        }}
                    >
                        {t("landing.ctaHeading")}
                    </Title1>
                    <Button
                        appearance="primary"
                        size="large"
                        style={{
                            backgroundColor: "#FFFFFF",
                            color: "#1E4FD8",
                            borderColor: "#FFFFFF",
                        }}
                        icon={<ArrowRight24Regular />}
                        onClick={() => navigate(authed ? "/dashboard" : "/register")}
                    >
                        {authed ? t("landing.goToDashboard") : t("landing.ctaJoin")}
                    </Button>
                </div>
            </section>
        </div>
    );
}
