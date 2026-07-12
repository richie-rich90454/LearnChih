import { MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Key24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/authStore";
import Seo from "@/components/Seo";
import PasswordBreachCheck from "@/components/PasswordBreachCheck";
import styles from "./AdminDashboardPage.module.css";

export default function PasswordBreachCheckPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
        return (
            <>
                <Seo
                    title={`${t("passwordBreach.title", "Password breach check")} — LernChih`}
                    canonicalPath="/admin/breach-check"
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
                title={`${t("passwordBreach.title", "Password breach check")} — LernChih`}
                canonicalPath="/admin/breach-check"
                robots="noindex, nofollow"
            />
            <header className={styles.header}>
                <span className={styles.headerIcon} aria-hidden="true">
                    <Key24Regular />
                </span>
                <h1 className={styles.title}>
                    {t("passwordBreach.title", "Password breach check")}
                </h1>
            </header>
            <PasswordBreachCheck />
        </div>
    );
}
