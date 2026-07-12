import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Gauge24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import RateLimitDashboard from "@/components/RateLimitDashboard";
import styles from "./AdminDashboardPage.module.css";

export default function RateLimitDashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("rateLimitDashboard.title", "Rate limits")} — LernChih`}
                    canonicalPath="/admin/rate-limits"
                    robots="noindex, nofollow"
                />
                <MessageBar intent="error">
                    <MessageBarBody>{t("admin.permissionDenied")}</MessageBarBody>
                </MessageBar>
            </>
        );
    }

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("rateLimitDashboard.title", "Rate limits")} — LernChih`}
                canonicalPath="/admin/rate-limits"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Gauge24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("rateLimitDashboard.title", "Rate limits")}
                </h1>
            </header>
            <RateLimitDashboard />
        </div>
    );
}
