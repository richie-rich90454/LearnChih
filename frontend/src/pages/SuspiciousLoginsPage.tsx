import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Warning24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import SuspiciousLoginAlerts from "@/components/SuspiciousLoginAlerts";
import styles from "./AdminDashboardPage.module.css";

export default function SuspiciousLoginsPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("suspiciousLogins.title", "Suspicious logins")} — LernChih`}
                    canonicalPath="/admin/suspicious-logins"
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
                title={`${t("suspiciousLogins.title", "Suspicious logins")} — LernChih`}
                canonicalPath="/admin/suspicious-logins"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Warning24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("suspiciousLogins.title", "Suspicious logins")}
                </h1>
            </header>
            <SuspiciousLoginAlerts />
        </div>
    );
}
