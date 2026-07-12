import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Flag24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import ReportTrends from "@/components/ReportTrends";
import styles from "./AdminDashboardPage.module.css";

export default function ReportTrendsPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("reportTrends.title", "Content report trends")} — LernChih`}
                    canonicalPath="/admin/report-trends"
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
                title={`${t("reportTrends.title", "Content report trends")} — LernChih`}
                canonicalPath="/admin/report-trends"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Flag24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("reportTrends.title", "Content report trends")}
                </h1>
            </header>
            <ReportTrends />
        </div>
    );
}
