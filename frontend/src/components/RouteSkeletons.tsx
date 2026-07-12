import type { CSSProperties, ReactNode } from "react";
import {
    Skeleton as FluentSkeleton,
    SkeletonItem,
    makeStyles,
    mergeClasses,
    tokens,
} from "@fluentui/react-components";

/**
 * Route-aware skeleton loaders.
 *
 * Each variant mirrors the layout shape of the destination page so the
 * Suspense fallback reads as a faithful preview instead of a generic box.
 * Built on Fluent UI's Skeleton primitives (opaque appearance + wave shimmer).
 * The shimmer is disabled automatically under `prefers-reduced-motion` both
 * by Fluent UI's own styles and by an explicit guard on the page root.
 *
 * CONVENTION (B75): Every lazy-loaded route in App.tsx must render inside a
 * <Suspense> whose fallback delegates to <RouteSkeleton pathname={...} />.
 * The LoadingFallback component in App.tsx reads `useLocation().pathname` and
 * hands it to RouteSkeleton, which picks a shape-aware variant via
 * pickVariant(). When adding a new lazy route, extend pickVariant() with a
 * matching branch (or fall back to the "default" shape) so the Suspense gap is
 * never a blank screen.
 *
 * CONVENTION (B88): Below-the-fold heavy widgets (e.g. charts, concept maps,
 * collaborative editors, PDF panels) should be code-split with React.lazy()
 * and wrapped in <Suspense fallback={<RouteSkeleton pathname={...} />}> so the
 * initial route paint is not blocked by a large component bundle. Route-level
 * lazy() is already applied to every page in App.tsx; apply the same pattern to
 * heavyweight widgets mounted inside a page.
 */

const useStyles = makeStyles({
    pageRoot: {
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: tokens.spacingHorizontalXXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    bounded: { maxWidth: "800px", marginInline: "auto" },
    bounded900: { maxWidth: "900px", marginInline: "auto" },
    bounded960: { maxWidth: "960px", marginInline: "auto" },
    bounded1000: { maxWidth: "1000px", marginInline: "auto" },
    srOnly: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
    },
    // Belt-and-suspenders: Fluent UI already neutralises the shimmer under
    // reduced motion, but we also force it off here so the contract is explicit.
    reducedMotionGuard: {
        "@media (prefers-reduced-motion: reduce)": {
            "& *": {
                animation: "none !important",
            },
        },
    },

    // Shared layout primitives
    rowBetween: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        flexWrap: "wrap",
    },
    column: {
        display: "flex",
        flexDirection: "column",
    },
    lines: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    actionRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        flexWrap: "wrap",
    },

    // Form / card shapes
    formCard: {
        width: "100%",
        maxWidth: "420px",
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },
    flashCard: {
        width: "100%",
        maxWidth: "600px",
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },
    notFoundCard: {
        width: "100%",
        maxWidth: "520px",
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalS,
        textAlign: "center",
    },

    // List shape
    list: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingHorizontalM,
    },
    listItem: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingHorizontalM,
    },
    listItemText: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
        flex: 1,
    },

    // Detail shape
    detailHeader: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    detailMeta: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },

    // Dashboard shape
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: tokens.spacingHorizontalM,
    },
    statCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    miniCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },

    // Study groups / feature grids
    groupGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    groupCard: {
        padding: tokens.spacingHorizontalM,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    cardHeaderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    featureGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    featureCard: {
        padding: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    featureHeader: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },

    // Table shape
    table: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    tableRow: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: tokens.spacingHorizontalL,
        padding: tokens.spacingHorizontalM,
    },

    // API docs shape
    docsRow: {
        display: "flex",
        gap: tokens.spacingHorizontalL,
        alignItems: "flex-start",
        flexWrap: "wrap",
    },
    sidebar: {
        width: "240px",
        flexShrink: 0,
        padding: tokens.spacingHorizontalM,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    docsMain: {
        flex: 1,
        minWidth: "280px",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    },

    // Landing hero shape
    heroSplit: {
        display: "flex",
        gap: tokens.spacingHorizontalXL,
        alignItems: "center",
        flexWrap: "wrap",
    },
    heroText: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        flex: 1,
        minWidth: "280px",
    },
    heroVisual: {
        flex: 1,
        minWidth: "280px",
    },
});

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

interface ItemProps {
    width?: string;
    height?: number;
    radius?: number | string;
}

function Item({ width = "100%", height = 14, radius = 4 }: ItemProps) {
    return <SkeletonItem style={{ width, height, borderRadius: radius }} />;
}

function Circle({ size = 40 }: { size?: number }) {
    return <SkeletonItem style={{ width: size, height: size, borderRadius: "50%" }} />;
}

function SkeletonPage({
    className,
    children,
    style,
}: {
    className?: string;
    children: ReactNode;
    style?: CSSProperties;
}) {
    const s = useStyles();
    return (
        <FluentSkeleton
            appearance="opaque"
            className={mergeClasses(s.pageRoot, s.reducedMotionGuard, className)}
            style={style}
            role="status"
            aria-busy="true"
        >
            <span className={s.srOnly}>Loading</span>
            {children}
        </FluentSkeleton>
    );
}

/* ------------------------------------------------------------------ */
/* Per-variant skeletons                                                */
/* ------------------------------------------------------------------ */

function FormSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.centered}>
            <div className={s.formCard}>
                <Item width="50%" height={28} />
                <Item width="100%" height={32} radius={tokens.borderRadiusMedium} />
                <Item width="100%" height={32} radius={tokens.borderRadiusMedium} />
                <Item width="100%" height={32} radius={tokens.borderRadiusMedium} />
                <Item width="100%" height={36} radius={tokens.borderRadiusMedium} />
            </div>
        </SkeletonPage>
    );
}

function ListSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded960}>
            <div className={s.rowBetween}>
                <Item width="40%" height={28} />
                <Item width="120px" height={32} radius={tokens.borderRadiusMedium} />
            </div>
            <div className={s.list}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div className={s.listItem} key={i}>
                        <Circle size={40} />
                        <div className={s.listItemText}>
                            <Item width="60%" height={16} />
                            <Item width="40%" height={12} />
                        </div>
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

function DetailSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded}>
            <Item width="80px" height={20} />
            <div className={s.detailHeader}>
                <Item width="70%" height={32} />
                <div className={s.detailMeta}>
                    <Circle size={32} />
                    <Item width="25%" height={14} />
                    <Item width="20%" height={14} />
                </div>
            </div>
            <div className={s.lines}>
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="70%" height={14} />
            </div>
            <div className={s.lines}>
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="55%" height={14} />
            </div>
        </SkeletonPage>
    );
}

function DashboardSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded960}>
            <div className={s.column} style={{ gap: tokens.spacingVerticalXS }}>
                <Item width="40%" height={32} />
                <Item width="30%" height={16} />
            </div>
            <div className={s.statsRow}>
                {[0, 1, 2].map((i) => (
                    <div className={s.statCard} key={i}>
                        <Item width="50%" height={14} />
                        <Item width="60%" height={24} />
                    </div>
                ))}
            </div>
            <Item width="25%" height={20} />
            <div className={s.cardGrid}>
                {[0, 1, 2].map((i) => (
                    <div className={s.miniCard} key={i}>
                        <Item width="70%" height={16} />
                        <Item width="100%" height={14} />
                        <Item width="50%" height={14} />
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

function FlashcardsSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.centered}>
            <div className={s.flashCard}>
                <Item width="50%" height={28} />
                <Item
                    width="100%"
                    height={160}
                    radius={tokens.borderRadiusLarge}
                />
                <div className={s.actionRow}>
                    <Item width="120px" height={36} radius={tokens.borderRadiusMedium} />
                    <Item width="120px" height={36} radius={tokens.borderRadiusMedium} />
                </div>
            </div>
        </SkeletonPage>
    );
}

function StudyGroupsSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded900}>
            <div className={s.rowBetween}>
                <Item width="40%" height={28} />
                <Item width="140px" height={32} radius={tokens.borderRadiusMedium} />
            </div>
            <div className={s.groupGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div className={s.groupCard} key={i}>
                        <div className={s.cardHeaderRow}>
                            <Item width="60%" height={18} />
                            <Item
                                width="50px"
                                height={20}
                                radius={tokens.borderRadiusSmall}
                            />
                        </div>
                        <Item width="100%" height={14} />
                        <Item width="70%" height={14} />
                        <Item
                            width="100px"
                            height={32}
                            radius={tokens.borderRadiusMedium}
                        />
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

function TableSkeleton() {
    const s = useStyles();
    const cols = 4;
    return (
        <SkeletonPage className={s.bounded1000}>
            <div className={s.rowBetween}>
                <Item width="30%" height={28} />
                <Item width="180px" height={32} radius={tokens.borderRadiusMedium} />
            </div>
            <div className={s.table}>
                <div className={s.tableRow}>
                    {Array.from({ length: cols }).map((_, i) => (
                        <Item key={i} width="100%" height={18} />
                    ))}
                </div>
                {Array.from({ length: 5 }).map((_, r) => (
                    <div className={s.tableRow} key={r}>
                        {Array.from({ length: cols }).map((_, i) => (
                            <Item key={i} width="100%" height={16} />
                        ))}
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

function ApiDocsSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded1000}>
            <div className={s.rowBetween}>
                <Item width="80px" height={20} />
                <Item width="80px" height={28} />
                <Item width="120px" height={20} />
            </div>
            <div className={s.docsRow}>
                <div className={s.sidebar}>
                    <Item width="70%" height={16} />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Item key={i} width="90%" height={14} />
                    ))}
                </div>
                <div className={s.docsMain}>
                    <Item width="40%" height={28} />
                    <Item
                        width="100%"
                        height={200}
                        radius={tokens.borderRadiusMedium}
                    />
                    <div className={s.lines}>
                        <Item width="100%" height={14} />
                        <Item width="100%" height={14} />
                        <Item width="80%" height={14} />
                    </div>
                </div>
            </div>
        </SkeletonPage>
    );
}

function LandingSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded960}>
            <div className={s.heroSplit}>
                <div className={s.heroText}>
                    <Item width="80%" height={40} />
                    <Item width="60%" height={40} />
                    <Item width="70%" height={18} />
                    <Item width="90%" height={18} />
                    <div className={s.actionRow}>
                        <Item
                            width="140px"
                            height={40}
                            radius={tokens.borderRadiusMedium}
                        />
                        <Item
                            width="140px"
                            height={40}
                            radius={tokens.borderRadiusMedium}
                        />
                    </div>
                </div>
                <div className={s.heroVisual}>
                    <Item
                        width="100%"
                        height={220}
                        radius={tokens.borderRadiusLarge}
                    />
                </div>
            </div>
            <div className={s.featureGrid}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div className={s.featureCard} key={i}>
                        <div className={s.featureHeader}>
                            <Circle size={32} />
                            <Item width="60%" height={18} />
                        </div>
                        <Item width="100%" height={14} />
                        <Item width="70%" height={14} />
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

function NotFoundSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.centered}>
            <div className={s.notFoundCard}>
                <Item width="30%" height={64} />
                <Item width="60%" height={28} />
                <Item width="80%" height={16} />
                <div className={s.actionRow} style={{ justifyContent: "center" }}>
                    <Item
                        width="160px"
                        height={36}
                        radius={tokens.borderRadiusMedium}
                    />
                    <Item
                        width="160px"
                        height={36}
                        radius={tokens.borderRadiusMedium}
                    />
                </div>
            </div>
        </SkeletonPage>
    );
}

function DefaultSkeleton() {
    const s = useStyles();
    return (
        <SkeletonPage className={s.bounded960}>
            <Item width="40%" height={28} />
            <div className={s.lines}>
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="100%" height={14} />
                <Item width="70%" height={14} />
            </div>
            <div className={s.cardGrid}>
                {[0, 1].map((i) => (
                    <div className={s.miniCard} key={i}>
                        <Item width="60%" height={18} />
                        <Item width="100%" height={14} />
                        <Item width="50%" height={14} />
                    </div>
                ))}
            </div>
        </SkeletonPage>
    );
}

/* ------------------------------------------------------------------ */
/* Variant selection                                                    */
/* ------------------------------------------------------------------ */

type Variant =
    | "form"
    | "list"
    | "detail"
    | "dashboard"
    | "flashcards"
    | "study-groups"
    | "table"
    | "api-docs"
    | "landing"
    | "not-found"
    | "default";

function pickVariant(pathname: string): Variant {
    if (!pathname) return "default";
    const path = pathname.replace(/\/+$/, "") || "/";

    if (
        path === "/login" ||
        path === "/register" ||
        path === "/verify" ||
        path === "/forgot-password" ||
        path === "/reset-password"
    ) {
        return "form";
    }
    if (path === "/") return "landing";
    if (path === "/dashboard") return "dashboard";
    if (path === "/flashcards" || path === "/quizzes") return "flashcards";
    if (path === "/study-groups") return "study-groups";
    if (path === "/admin" || path === "/moderation") return "table";
    if (path === "/api-docs") return "api-docs";

    // Detail pages (checked before list routes — e.g. /resources/:id).
    if (path.startsWith("/resources/")) return "detail";
    if (path.startsWith("/channels/")) return "detail";
    if (path === "/profile" || path.startsWith("/profile/")) return "detail";

    if (
        path === "/resources" ||
        path === "/channels" ||
        path === "/search" ||
        path === "/bookmarks" ||
        path === "/notifications" ||
        path === "/leaderboard"
    ) {
        return "list";
    }

    // Any other path is served by the catch-all NotFoundPage.
    return "not-found";
}

export function RouteSkeleton({ pathname }: { pathname: string }) {
    switch (pickVariant(pathname)) {
        case "form":
            return <FormSkeleton />;
        case "list":
            return <ListSkeleton />;
        case "detail":
            return <DetailSkeleton />;
        case "dashboard":
            return <DashboardSkeleton />;
        case "flashcards":
            return <FlashcardsSkeleton />;
        case "study-groups":
            return <StudyGroupsSkeleton />;
        case "table":
            return <TableSkeleton />;
        case "api-docs":
            return <ApiDocsSkeleton />;
        case "landing":
            return <LandingSkeleton />;
        case "not-found":
            return <NotFoundSkeleton />;
        default:
            return <DefaultSkeleton />;
    }
}
