import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { ArrowHookDownLeft24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import WebhookCatalog from "@/components/WebhookCatalog";
import styles from "./AdminDashboardPage.module.css";

export default function WebhooksPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("webhookCatalog.title", "Webhook catalog")} — LernChih`}
                    canonicalPath="/admin/webhooks"
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
                title={`${t("webhookCatalog.title", "Webhook catalog")} — LernChih`}
                canonicalPath="/admin/webhooks"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <ArrowHookDownLeft24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("webhookCatalog.title", "Webhook catalog")}
                </h1>
            </header>
            <WebhookCatalog />
        </div>
    );
}
