import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { SearchInfo24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import SeoHealth from "@/components/SeoHealth";
import styles from "./AdminDashboardPage.module.css";

export default function SeoHealthPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("seoHealth.title", "SEO health")} — LernChih`}
                    canonicalPath="/admin/seo-health"
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
                title={`${t("seoHealth.title", "SEO health")} — LernChih`}
                canonicalPath="/admin/seo-health"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <SearchInfo24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("seoHealth.title", "SEO health")}
                </h1>
            </header>
            <SeoHealth />
        </div>
    );
}
