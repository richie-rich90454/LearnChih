import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Mail24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import EmailDomainPolicy from "@/components/EmailDomainPolicy";
import styles from "./AdminDashboardPage.module.css";

export default function EmailDomainPolicyPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("emailDomainPolicy.title", "Email domain policy")} — LernChih`}
                    canonicalPath="/admin/email-domains"
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
                title={`${t("emailDomainPolicy.title", "Email domain policy")} — LernChih`}
                canonicalPath="/admin/email-domains"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Mail24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("emailDomainPolicy.title", "Email domain policy")}
                </h1>
            </header>
            <EmailDomainPolicy />
        </div>
    );
}
