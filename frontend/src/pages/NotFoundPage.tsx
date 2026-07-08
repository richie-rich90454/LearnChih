import { Link } from "react-router-dom";
import { ArrowLeft24Regular, Search24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import stateStyles from "../components/States.module.css";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    const { t } = useTranslation();

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
                    <Link to="/">
                        <Button variant="primary" icon={<ArrowLeft24Regular />}>
                            {t("notFound.backToHome")}
                        </Button>
                    </Link>
                    <Link to="/resources">
                        <Button variant="outline" icon={<Search24Regular />}>
                            {t("notFound.searchResources")}
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
