import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { PlugConnected24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import OAuthAccountsManager from "@/components/OAuthAccountsManager";
import styles from "./AdminDashboardPage.module.css";

export default function OAuthAccountsPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("oauthAccounts.title", "OAuth accounts")} — LernChih`}
                    canonicalPath="/admin/oauth-accounts"
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
                title={`${t("oauthAccounts.title", "OAuth accounts")} — LernChih`}
                canonicalPath="/admin/oauth-accounts"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <PlugConnected24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("oauthAccounts.title", "OAuth accounts")}
                </h1>
            </header>
            <OAuthAccountsManager />
        </div>
    );
}
