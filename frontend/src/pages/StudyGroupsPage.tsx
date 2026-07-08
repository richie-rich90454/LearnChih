import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@fluentui/react-components";
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
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import styles from "./List.module.css";

export default function StudyGroupsPage() {
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
        <div className={styles.page}>
            <Seo
                title="Study Groups — LernChih"
                description="Join or create study groups on LernChih."
                canonicalPath="/study-groups"
            />
            <header className={styles.pageHeader}>
                <h1 className={styles.title}>Study Groups</h1>
                <div className={styles.headerActions}>
                    <CreateStudyGroupDialog onCreated={refetch} />
                </div>
            </header>

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
                    <Card key={group.id} className={styles.item} padding="md">
                        <div className={styles.itemHeader}>
                            <h3 className={styles.itemTitle}>{group.name}</h3>
                            <Badge variant="neutral" size="small">
                                {group.isPublic ? "Public" : "Private"}
                            </Badge>
                        </div>
                        <p className={styles.itemBody}>{group.description}</p>
                        {group.subject && (
                            <Badge variant="accent" size="small">
                                {group.subject}
                            </Badge>
                        )}
                        <div className={styles.itemMeta}>
                            {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                        </div>
                        <div className={styles.itemActions}>
                            <Button variant="outline" size="small" onClick={() => handleJoin(group.id)}>
                                Join
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
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
