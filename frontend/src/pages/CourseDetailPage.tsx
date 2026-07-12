import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft24Regular } from "@fluentui/react-icons";
import Seo from "../components/Seo";
import ModuleProgress from "../components/ModuleProgress";
import { Button } from "../components/ui/Button";
import styles from "./CourseDetailPage.module.css";

/**
 * Minimal course detail page (F3). Hosts the ModuleProgress tracker for the
 * course identified by the `:id` route param. The page shell keeps SEO + a
 * centered reading width; ModuleProgress owns the data and rendering.
 */
export default function CourseDetailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const courseId = Number(id);

    if (!id || Number.isNaN(courseId)) {
        return (
            <div className={styles.page}>
                <Seo
                    title={`${t("resources.course")} — LernChih`}
                    canonicalPath="/"
                />
                <p className={styles.invalid}>{t("common.error")}</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("resources.course")} — LernChih`}
                canonicalPath={`/courses/${courseId}`}
            />
            <Button
                variant="subtle"
                size="small"
                icon={<ArrowLeft24Regular />}
                onClick={() => navigate("/resources")}
                className={styles.backButton}
            >
                {t("common.back")}
            </Button>
            <ModuleProgress courseId={courseId} />
        </div>
    );
}
