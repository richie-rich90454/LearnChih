import { type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/MagneticButton";
import { LogoWall } from "@/components/LogoWall";
import { LogoMarkAnimated } from "@/components/Logo";
import { StickyScrollStack, type StickyScrollCard } from "@/components/StickyScrollStack";
import useAuthStore from "@/store/authStore";
import styles from "./LandingPage.module.css";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.6;

interface BentoCell {
    key: string;
    title: string;
    description: string;
    icon: typeof Document24Regular;
    route: string;
    className: string;
}

export default function LandingPage() {
    const { t } = useTranslation();
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
                        <p className={styles.subtext}>{t("landing.subheadline")}</p>
                    </motion.div>
                    <motion.div
                        className={styles.heroActions}
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION, ease: EASE, delay: 0.44 }}
                    >
                        <MagneticButton>
                            <Button
                                variant="primary"
                                size="large"
                                icon={<ArrowRight24Regular />}
                                onClick={() => navigate("/resources")}
                            >
                                {t("landing.browseResources")}
                            </Button>
                        </MagneticButton>
                        <Button variant="outline" size="large" onClick={() => navigate("/channels")}>
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

            {/* Section 2: Logo wall (social proof) */}
            <div className={styles.logoWallBand}>
                <div className={styles.container}>
                    <LogoWall />
                </div>
            </div>

            {/* Section 3: Bento feature grid */}
            <section className={styles.bentoSection}>
                <div className={styles.container}>
                    <h2 className={styles.bentoHeading}>{t("landing.bentoHeading")}</h2>
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
                                    whileHover={
                                        reduce
                                            ? undefined
                                            : { y: -3, transition: { duration: 0.18, ease: EASE } }
                                    }
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: EASE,
                                        delay: i * 0.06,
                                    }}
                                >
                                    <span className={styles.cellIcon}>
                                        <Icon />
                                    </span>
                                    <h3 className={styles.cellTitle}>{cell.title}</h3>
                                    <p className={styles.cellDesc}>{cell.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 4: Sticky-scroll feature stack */}
            <section className={styles.stickySection}>
                <StickyScrollStack cards={stickyCards} />
            </section>

            {/* Section 5: CTA band */}
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <div className={styles.ctaBand}>
                        <h2 className={styles.ctaHeading}>{t("landing.ctaHeading")}</h2>
                        <Button
                            variant="primary"
                            size="large"
                            className={styles.ctaButton}
                            icon={<ArrowRight24Regular />}
                            onClick={() => navigate(authed ? "/dashboard" : "/register")}
                        >
                            {authed ? t("landing.goToDashboard") : t("landing.ctaJoin")}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
