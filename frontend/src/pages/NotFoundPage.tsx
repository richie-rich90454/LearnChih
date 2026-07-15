import { useNavigate } from "react-router-dom";
import { ArrowLeft24Regular, Search24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import stateStyles from "../components/States.module.css";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <Seo title={t("notFound.title")} canonicalPath="/404" robots="noindex, follow" />
            <div className={stateStyles.empty}>
                <div className={styles.code} aria-hidden="true">
                    404
                </div>
                <h1 className={styles.title}>{t("notFound.title")}</h1>
                <p className={stateStyles.emptyBody}>{t("notFound.message")}</p>
                <div className={stateStyles.errorAction}>
                    <Button
                        variant="primary"
                        icon={<ArrowLeft24Regular />}
                        onClick={() => navigate("/")}
                    >
                        {t("notFound.backToHome")}
                    </Button>
                    <Button
                        variant="outline"
                        icon={<Search24Regular />}
                        onClick={() => navigate("/resources")}
                    >
                        {t("notFound.searchResources")}
                    </Button>
                </div>
            </div>
        </main>
    );
}
