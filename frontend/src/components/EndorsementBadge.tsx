import { Badge, makeStyles, shorthands } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useEndorsements } from "../hooks/useSocial";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    skills: {
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
    },
});

interface EndorsementBadgeProps {
    userId: number;
}

export function EndorsementBadge({ userId }: EndorsementBadgeProps) {
    const styles = useStyles();
    const { t } = useTranslation();
    const { data: endorsements, isLoading } = useEndorsements(userId);

    if (isLoading) {
        return <div>{t("endorsement.loading")}</div>;
    }

    if (!endorsements || endorsements.length === 0) {
        return null;
    }

    // Group endorsements by skill to show counts
    const bySkill = endorsements.reduce<Record<string, number>>((acc, e) => {
        acc[e.skill] = (acc[e.skill] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className={styles.root}>
            <h4 style={{ margin: 0 }}>{t("endorsement.title")}</h4>
            <div className={styles.skills}>
                {Object.entries(bySkill).map(([skill, count]) => (
                    <Badge
                        key={skill}
                        appearance="filled"
                        color="success"
                        title={t("endorsement.count", { count })}
                        {...shorthands.margin("2px")}
                    >
                        {skill} × {count}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
