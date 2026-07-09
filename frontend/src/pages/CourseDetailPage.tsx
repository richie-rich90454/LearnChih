import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import ModuleProgress from "../components/ModuleProgress";
import styles from "./CourseDetailPage.module.css";

/**
 * Minimal course detail page (F3). Hosts the ModuleProgress tracker for the
 * course identified by the `:id` route param. The page shell keeps SEO + a
 * centered reading width; ModuleProgress owns the data and rendering.
 */
export default function CourseDetailPage() {
    const { t } = useTranslation();
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
            <ModuleProgress courseId={courseId} />
        </div>
    );
}
