import { makeStyles, tokens, Subtitle2 } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";

/**
 * Tech-stack logos shown as a trust wall. Logos are served as brand-colored
 * SVGs from the Simple Icons CDN. They render muted (grayscale) by default
 * and snap to full brand color on hover. Brand colors are bright enough to
 * stay legible on both light and dark surfaces, so no invert filter is
 * required.
 */
const BRANDS = [
    { slug: "react", name: "React" },
    { slug: "vite", name: "Vite" },
    { slug: "typescript", name: "TypeScript" },
    { slug: "springboot", name: "Spring Boot" },
    { slug: "mysql", name: "MySQL" },
    { slug: "tailwindcss", name: "Tailwind CSS" },
];

const useStyles = makeStyles({
    root: {
        padding: `${tokens.spacingVerticalXL} 0`,
    },
    heading: {
        color: tokens.colorNeutralForeground3,
        textAlign: "center",
        marginBottom: tokens.spacingVerticalL,
    },
    grid: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.spacingHorizontalXXL,
        "@media (max-width: 640px)": {
            gap: tokens.spacingHorizontalL,
        },
    },
    logo: {
        height: "28px",
        width: "28px",
        filter: "grayscale(1) opacity(0.6)",
        transition: `filter var(--motion-base) var(--motion-ease)`,
        "&:hover": {
            filter: "grayscale(0) opacity(1)",
        },
        "@media (max-width: 640px)": {
            height: "24px",
            width: "24px",
        },
    },
});

export function LogoWall() {
    const styles = useStyles();
    const { t } = useTranslation();

    return (
        <section className={styles.root} aria-label={t("landing.logoWallHeading")}>
            <Subtitle2 as="p" className={styles.heading}>
                {t("landing.logoWallHeading")}
            </Subtitle2>
            <div className={styles.grid}>
                {BRANDS.map((brand) => (
                    <img
                        key={brand.slug}
                        className={styles.logo}
                        src={`https://cdn.simpleicons.org/${brand.slug}`}
                        alt={`${brand.name} logo`}
                        loading="lazy"
                        width={28}
                        height={28}
                    />
                ))}
            </div>
        </section>
    );
}
