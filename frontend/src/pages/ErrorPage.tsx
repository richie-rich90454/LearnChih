import { Link } from "react-router-dom";
import {
    ArrowCounterclockwise24Regular,
    ErrorCircle24Regular,
    ArrowLeft24Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { Button } from "../components/ui/Button";
import stateStyles from "../components/States.module.css";
import styles from "./ErrorPage.module.css";

export default function ErrorPage() {
    const { t } = useTranslation();

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <main className={styles.page}>
            <Seo title={t("errorPage.title")} canonicalPath="/error" robots="noindex, nofollow" />
            <div className={stateStyles.error} role="alert">
                <div className={stateStyles.errorIcon} aria-hidden="true">
                    <ErrorCircle24Regular />
                </div>
                <h1 className={stateStyles.errorTitle}>{t("errorPage.title")}</h1>
                <p className={stateStyles.errorBody}>{t("errorPage.message")}</p>
                <div className={stateStyles.errorAction}>
                    <Button
                        variant="primary"
                        icon={<ArrowCounterclockwise24Regular />}
                        onClick={handleRetry}
                    >
                        {t("errorPage.retry")}
                    </Button>
                    <Link to="/">
                        <Button variant="outline" icon={<ArrowLeft24Regular />}>
                            {t("notFound.backToHome")}
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
