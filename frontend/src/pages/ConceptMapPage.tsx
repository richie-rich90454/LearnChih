import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { Diagram24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { getSubjects } from "@/api/conceptMap";
import Seo from "@/components/Seo";
import { Select, Option } from "@/components/ui/Select";
import ConceptMap from "@/components/ConceptMap";
import styles from "./ConceptMapPage.module.css";

/**
 * Concept-map page (F6). Lets the user pick a subject from a dropdown and
 * renders that subject's draggable concept-map canvas.
 */
export default function ConceptMapPage() {
    const { t } = useTranslation();
    const [subjectId, setSubjectId] = useState<number | null>(null);

    const subjectsQuery = useQuery({
        queryKey: ["subjects"],
        queryFn: () => getSubjects().then((r) => r.data),
    });

    const subjects = subjectsQuery.data ?? [];

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("conceptMap.title")} — LernChih`}
                description={t("conceptMap.description")}
                canonicalPath="/concept-map"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon}>
                        <Diagram24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("conceptMap.title")}</h1>
                        <p className={styles.subtitle}>{t("conceptMap.description")}</p>
                    </div>
                </div>
            </header>

            <div className={styles.selectorRow}>
                {subjectsQuery.isLoading ? (
                    <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                        <Spinner size="small" aria-hidden="true" />
                    </div>
                ) : subjectsQuery.isError ? (
                    <MessageBar intent="error">
                        <MessageBarBody>{t("conceptMap.error")}</MessageBarBody>
                    </MessageBar>
                ) : (
                    <Select
                        label={t("conceptMap.selectSubject")}
                        value={subjectId !== null ? String(subjectId) : ""}
                        onChange={(_, d) => setSubjectId(d.value ? Number(d.value) : null)}
                        className={styles.subjectSelect}
                    >
                        <Option value="">{t("conceptMap.selectSubject")}</Option>
                        {subjects.map((s) => (
                            <Option key={s.id} value={String(s.id)}>
                                {s.name}
                            </Option>
                        ))}
                    </Select>
                )}
            </div>

            {subjectId !== null && <ConceptMap subjectId={subjectId} />}
        </div>
    );
}
