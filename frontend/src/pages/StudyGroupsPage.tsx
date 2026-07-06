import { useQuery } from "@tanstack/react-query";
import {
    makeStyles,
    tokens,
    Title2,
    Body1,
    Card,
    Badge,
    Button,
    Spinner,
} from "@fluentui/react-components";
import { PeopleCommunity24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getStudyGroups,
    joinStudyGroup,
    leaveStudyGroup,
    type StudyGroup,
} from "../api/studyGroups";
import Seo from "../components/Seo";
import { CreateStudyGroupDialog } from "../components/CreateStudyGroupDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "900px",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalM,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: tokens.spacingHorizontalM,
    },
    card: {
        padding: tokens.spacingHorizontalM,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
});

export default function StudyGroupsPage() {
    const styles = useStyles();
    const { t } = useTranslation();
    const { data, isLoading, isError, refetch } = useQuery<StudyGroup[]>({
        queryKey: ["studyGroups"],
        queryFn: () => getStudyGroups().then((r) => r.data),
    });

    const groups = data ?? [];

    const handleJoin = async (id: number) => {
        await joinStudyGroup(id);
        refetch();
    };

    const handleLeave = async (id: number) => {
        await leaveStudyGroup(id);
        refetch();
    };

    return (
        <div className={styles.container}>
            <Seo
                title="Study Groups — LernChih"
                description="Join or create study groups on LernChih."
                canonicalPath="/study-groups"
            />
            <div className={styles.headerRow}>
                <Title2 as="h1">Study Groups</Title2>
                <CreateStudyGroupDialog onCreated={refetch} />
            </div>

            {isLoading && <Spinner label="Loading study groups..." />}
            {isError && (
                <ErrorState
                    icon={<PeopleCommunity24Regular />}
                    title={t("error.studyGroupsTitle")}
                    description={t("error.studyGroupsDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("error.tryAgain")}
                />
            )}
            {!isLoading && !isError && groups.length === 0 && (
                <EmptyState
                    icon={<PeopleCommunity24Regular />}
                    title={t("empty.studyGroupsTitle")}
                    description={t("empty.studyGroupsDescription")}
                />
            )}

            <div className={styles.grid}>
                {groups.map((group) => (
                    <Card key={group.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Body1 style={{ fontWeight: 600 }}>{group.name}</Body1>
                            <Badge appearance="outline" size="small">
                                {group.isPublic ? "Public" : "Private"}
                            </Badge>
                        </div>
                        <Body1 style={{ color: "var(--colorNeutralForeground3)" }}>
                            {group.description}
                        </Body1>
                        {group.subject && (
                            <Badge appearance="tint" size="small">
                                {group.subject}
                            </Badge>
                        )}
                        <Body1 style={{ fontSize: "var(--fontSizeBase200)" }}>
                            {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                        </Body1>
                        <div
                            style={{
                                display: "flex",
                                gap: tokens.spacingHorizontalS,
                                marginTop: tokens.spacingVerticalS,
                            }}
                        >
                            <Button size="small" onClick={() => handleJoin(group.id)}>
                                Join
                            </Button>
                            <Button
                                size="small"
                                appearance="subtle"
                                onClick={() => handleLeave(group.id)}
                            >
                                Leave
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
