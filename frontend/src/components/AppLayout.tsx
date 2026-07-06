import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Avatar,
    Button,
    Caption1,
    Drawer,
    DrawerHeader,
    DrawerBody,
    InlineDrawer,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Text,
    Title3,
} from "@fluentui/react-components";
import {
    Navigation24Regular,
    Home24Regular,
    Document24Regular,
    Chat24Regular,
    Trophy24Regular,
    Person24Regular,
    Shield24Regular,
    SignOut24Regular,
    SlideLayout24Regular,
    QuestionCircle24Regular,
    PeopleTeam24Regular,
    WeatherMoon24Regular,
    WeatherSunny24Regular,
} from "@fluentui/react-icons";
import useAuthStore from "@/store/authStore";
import { useDir } from "@/hooks/useDir";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/hooks/useThemeStore";
import { LogoFull } from "@/components/Logo";
import { SearchBar } from "./SearchBar";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface NavSection {
    labelKey: string;
    items: NavItem[];
}

const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "100vh",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        backgroundColor: tokens.colorNeutralBackground1,
        minHeight: "56px",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    headerCenter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: `0 ${tokens.spacingHorizontalL}`,
        maxWidth: "520px",
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    mainArea: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
    },
    content: {
        flex: 1,
        overflow: "auto",
        padding: tokens.spacingHorizontalXL,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        width: "100%",
        textAlign: "left",
        justifyContent: "flex-start",
        padding: `10px ${tokens.spacingHorizontalL}`,
        borderLeft: `3px solid transparent`,
    },
    navItemActive: {
        borderLeft: `3px solid ${tokens.colorBrandBackground}`,
        backgroundColor: tokens.colorBrandBackground2,
    },
    navContainer: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    navSection: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    sectionLabel: {
        color: tokens.colorNeutralForeground2,
        backgroundColor: tokens.colorNeutralBackground1,
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalXXS}`,
    },
    logoButton: {
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
        minHeight: "0",
        alignSelf: "flex-start",
    },
    mobileMenuButton: {
        display: "none",
        "@media (max-width: 768px)": {
            display: "inline-flex",
        },
    },
    desktopDrawer: {
        "@media (max-width: 768px)": {
            display: "none",
        },
    },
    skipLink: {
        position: "absolute",
        top: "-40px",
        left: "0",
        background: "#0078d4",
        color: "white",
        padding: "8px 16px",
        zIndex: "1000",
        transition: "top 0.2s",
        "&:focus": {
            top: "0",
        },
    },
});

const PUBLIC_NAV_PATHS = new Set([
    "/resources",
    "/channels",
    "/leaderboard",
    "/search",
    "/api-docs",
]);

const getNavSections = (
    t: (key: string) => string,
    authenticated: boolean,
    isAdmin: boolean,
): NavSection[] => {
    const mainItems: NavItem[] = [
        { path: "/dashboard", label: t("nav.dashboard"), icon: <Home24Regular /> },
        { path: "/resources", label: t("nav.resources"), icon: <Document24Regular /> },
        { path: "/channels", label: t("nav.channels"), icon: <Chat24Regular /> },
        { path: "/leaderboard", label: t("nav.leaderboard"), icon: <Trophy24Regular /> },
    ];
    const learningItems: NavItem[] = [
        { path: "/flashcards", label: t("nav.flashcards"), icon: <SlideLayout24Regular /> },
        { path: "/quizzes", label: t("nav.quizzes"), icon: <QuestionCircle24Regular /> },
        { path: "/study-groups", label: t("nav.studyGroups"), icon: <PeopleTeam24Regular /> },
    ];
    const accountItems: NavItem[] = [
        { path: "/profile", label: t("nav.profile"), icon: <Person24Regular /> },
    ];

    const filterPublic = (items: NavItem[]) =>
        authenticated ? items : items.filter((item) => PUBLIC_NAV_PATHS.has(item.path));

    const sections: NavSection[] = [];
    const main = filterPublic(mainItems);
    if (main.length > 0) {
        sections.push({ labelKey: "nav.sections.main", items: main });
    }
    if (authenticated) {
        sections.push({ labelKey: "nav.sections.learning", items: learningItems });
        const account: NavItem[] = isAdmin
            ? [
                  ...accountItems,
                  { path: "/admin", label: t("nav.moderation"), icon: <Shield24Regular /> },
              ]
            : accountItems;
        sections.push({ labelKey: "nav.sections.account", items: account });
    }
    return sections;
};

export default function AppLayout() {
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuthStore();
    const { t, i18n } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const mode = useThemeStore((s) => s.mode);
    const toggle = useThemeStore((s) => s.toggle);
    const dir = useDir();

    const authenticated = isAuthenticated();
    const isAdmin = authenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR");

    const handleNav = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string): boolean => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const navSections = getNavSections(t, authenticated, isAdmin);

    const NavLinks = () => (
        <>
            {navSections.map((section) => (
                <div key={section.labelKey} className={styles.navSection}>
                    <Caption1 className={styles.sectionLabel}>{t(section.labelKey)}</Caption1>
                    {section.items.map((item) => (
                        <Button
                            key={item.path}
                            appearance="subtle"
                            className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ""}`}
                            onClick={() => handleNav(item.path)}
                        >
                            {item.icon}
                            <Text>{item.label}</Text>
                        </Button>
                    ))}
                </div>
            ))}
        </>
    );

    return (
        <div className={styles.root} dir={dir}>
            <a href="#main-content" className={styles.skipLink}>
                {t("a11y.skipToContent")}
            </a>

            {/* Desktop sidebar */}
            <aside className={styles.desktopDrawer} aria-label={t("a11y.sidebar")}>
                <InlineDrawer open position="start" size="small">
                    <DrawerHeader>
                        <Button
                            appearance="subtle"
                            className={styles.logoButton}
                            onClick={() => navigate(authenticated ? "/dashboard" : "/")}
                            aria-label="LernChih"
                        >
                            <LogoFull size={28} title="LernChih" />
                        </Button>
                    </DrawerHeader>
                    <DrawerBody>
                        <nav aria-label={t("a11y.mainNavigation")} className={styles.navContainer}>
                            <NavLinks />
                        </nav>
                    </DrawerBody>
                </InlineDrawer>
            </aside>

            {/* Mobile drawer */}
            <Drawer
                open={mobileOpen}
                position="start"
                size="small"
                onOpenChange={(_: unknown, data: { open: boolean }) => setMobileOpen(data.open)}
            >
                <DrawerHeader>
                    <Button
                        appearance="subtle"
                        className={styles.logoButton}
                        onClick={() => navigate(authenticated ? "/dashboard" : "/")}
                        aria-label="LernChih"
                    >
                        <LogoFull size={28} title="LernChih" />
                    </Button>
                </DrawerHeader>
                <DrawerBody>
                    <nav aria-label={t("a11y.mainNavigation")} className={styles.navContainer}>
                        <NavLinks />
                    </nav>
                </DrawerBody>
            </Drawer>

            {/* Main area */}
            <div className={styles.mainArea}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Button
                            appearance="subtle"
                            icon={<Navigation24Regular />}
                            className={styles.mobileMenuButton}
                            onClick={() => setMobileOpen(true)}
                        />
                        <Title3 className={styles.desktopDrawer} style={{ display: "none" }}>
                            LernChih
                        </Title3>
                    </div>

                    <div className={styles.headerCenter}>
                        <SearchBar placeholder={t("common.searchPlaceholder")} />
                    </div>

                    <div className={styles.headerRight}>
                        {authenticated && <NotificationBell />}
                        <Button
                            appearance="subtle"
                            onClick={() => {
                                const next = i18n.language === "en" ? "zh" : "en";
                                i18n.changeLanguage(next);
                                // syncDocumentLang in i18n/index.ts already persists
                                // the choice to localStorage; no need to duplicate here.
                            }}
                            aria-label={t("language.label")}
                        >
                            {i18n.language.startsWith("zh") ? "中" : "EN"}
                        </Button>
                        <Button
                            appearance="subtle"
                            onClick={(e) => {
                                const rect = (
                                    e.currentTarget as HTMLButtonElement
                                ).getBoundingClientRect();
                                toggle({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2,
                                });
                            }}
                            aria-label={t("theme.toggle")}
                        >
                            {mode === "light" ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
                        </Button>
                        {authenticated ? (
                            <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                    <Button appearance="subtle" style={{ gap: "8px" }}>
                                        <Avatar name={user?.name || t("common.user")} size={28} />
                                        <Text>{user?.name || t("common.user")}</Text>
                                    </Button>
                                </MenuTrigger>
                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            icon={<Person24Regular />}
                                            onClick={() => navigate("/profile")}
                                        >
                                            {t("nav.profile")}
                                        </MenuItem>
                                        <MenuItem
                                            icon={<SignOut24Regular />}
                                            onClick={handleLogout}
                                        >
                                            {t("nav.logout")}
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        ) : (
                            <>
                                <Button appearance="subtle" onClick={() => navigate("/login")}>
                                    {t("nav.login")}
                                </Button>
                                <Button appearance="primary" onClick={() => navigate("/register")}>
                                    {t("nav.register")}
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <main id="main-content" tabIndex={-1} className={styles.content}>
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}
