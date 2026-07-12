import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Laptop24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import SessionManager from "@/components/SessionManager";
import styles from "./AdminDashboardPage.module.css";

export default function SessionsPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("sessionManagement.title", "Sessions")} — LernChih`}
                    canonicalPath="/admin/sessions"
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
                title={`${t("sessionManagement.title", "Sessions")} — LernChih`}
                canonicalPath="/admin/sessions"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Laptop24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("sessionManagement.title", "Sessions")}
                </h1>
            </header>
            <SessionManager />
        </div>
    );
}
