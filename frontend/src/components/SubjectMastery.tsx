import { useTranslation } from "react-i18next";
import { Gauge24Regular } from "@fluentui/react-icons";
import { Card } from "@/components/ui/Card";
import { useMasteryStore } from "@/store/masteryStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./SubjectMastery.module.css";

export interface Subject {
    id: number;
    name: string;
}

const SAMPLE_SUBJECTS: Subject[] = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Physics" },
    { id: 3, name: "Computer Science" },
    { id: 4, name: "Literature" },
    { id: 5, name: "History" },
];

/**
 * Per-user subject mastery widget (F30). Shows a 1-5 dot meter for each
 * subject; clicking a dot sets the mastery level. Uses a hardcoded sample
 * list of subjects.
 *
 * Spec ref: F30.
 */
export function SubjectMastery() {
    const { t } = useTranslation();
    const reduced = useReducedMotion();
    const levels = useMasteryStore((s) => s.levels);
    const setLevel = useMasteryStore((s) => s.setLevel);

    const dots = [1, 2, 3, 4, 5];

    return (
        <Card padding="lg" className={styles.card}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    <Gauge24Regular />
                </span>
                <div className={styles.headerText}>
                    <h2 className={styles.title}>
                        {t("subjectMastery.title", "Subject Mastery")}
                    </h2>
                    <p className={styles.subtitle}>
                        {t("subjectMastery.description", "Set your mastery level for each subject.")}
                    </p>
                </div>
            </div>

            <ul className={styles.list}>
                {SAMPLE_SUBJECTS.map((subject) => {
                    const level = levels[subject.id] ?? 0;
                    return (
                        <li key={subject.id} className={styles.subjectRow}>
                            <span className={styles.subjectName}>{subject.name}</span>
                            <div
                                className={reduced ? styles.dotsStatic : styles.dots}
                                role="radiogroup"
                                aria-label={t("subjectMastery.levelAria", {
                                    defaultValue: "Mastery level for {{subject}}",
                                    subject: subject.name,
                                })}
                            >
                                {dots.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={
                                            value <= level ? styles.dotActive : styles.dot
                                        }
                                        onClick={() => setLevel(subject.id, value)}
                                        aria-checked={level === value}
                                        aria-label={t("subjectMastery.dotAria", {
                                            defaultValue: "{{value}} out of 5",
                                            value,
                                        })}
                                        role="radio"
                                    />
                                ))}
                            </div>
                            <span className={styles.levelLabel}>
                                {level > 0
                                    ? t("subjectMastery.level", {
                                          defaultValue: "{{level}}/5",
                                          level,
                                      })
                                    : t("subjectMastery.notRated", "Not rated")}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

export default SubjectMastery;
