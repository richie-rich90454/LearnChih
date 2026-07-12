import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { ShieldKeyhole24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import TwoFactorPolicyPanel from "@/components/TwoFactorPolicyPanel";
import styles from "./AdminDashboardPage.module.css";

export default function TwoFactorPolicyPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("twoFactorPolicy.title", "Two-factor enforcement")} — LernChih`}
                    canonicalPath="/admin/2fa-policy"
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
                title={`${t("twoFactorPolicy.title", "Two-factor enforcement")} — LernChih`}
                canonicalPath="/admin/2fa-policy"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <ShieldKeyhole24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("twoFactorPolicy.title", "Two-factor enforcement")}
                </h1>
            </header>
            <TwoFactorPolicyPanel />
        </div>
    );
}
