import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Spinner,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
} from "@fluentui/react-components";
import { PeopleCommunity24Regular, Chat24Regular, Calendar24Regular, Whiteboard24Regular, Call24Regular, ShareScreenStart24Regular, Video24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
    getStudyGroups,
    joinStudyGroup,
    leaveStudyGroup,
    type StudyGroup,
} from "../api/studyGroups";
import Seo from "../components/Seo";
import { CreateStudyGroupDialog } from "../components/CreateStudyGroupDialog";
import { StudyGroupChat } from "../components/StudyGroupChat";
import { GroupEvents } from "../components/GroupEvents";
import { Whiteboards } from "../components/Whiteboard";
import { VoiceRooms } from "../components/VoiceRoom";
import { ScreenShares } from "../components/ScreenShare";
import { CoWatch } from "../components/CoWatch";
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

    const [chatGroup, setChatGroup] = useState<StudyGroup | null>(null);
    const [eventsGroup, setEventsGroup] = useState<StudyGroup | null>(null);
    const [whiteboardGroup, setWhiteboardGroup] = useState<StudyGroup | null>(null);
    const [voiceRoomGroup, setVoiceRoomGroup] = useState<StudyGroup | null>(null);
    const [screenShareGroup, setScreenShareGroup] = useState<StudyGroup | null>(null);
    const [cowatchGroup, setCowatchGroup] = useState<StudyGroup | null>(null);

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

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}
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
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Chat24Regular />}
                                onClick={() => setChatGroup(group)}
                            >
                                {t("groupChat.open")}
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Calendar24Regular />}
                                onClick={() => setEventsGroup(group)}
                            >
                                {t("groupEvents.title")}
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Whiteboard24Regular />}
                                onClick={() => setWhiteboardGroup(group)}
                            >
                                {t("whiteboards.title")}
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Call24Regular />}
                                onClick={() => setVoiceRoomGroup(group)}
                            >
                                {t("voiceRooms.title")}
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<ShareScreenStart24Regular />}
                                onClick={() => setScreenShareGroup(group)}
                            >
                                {t("screenShares.title")}
                            </Button>
                            <Button
                                variant="subtle"
                                size="small"
                                icon={<Video24Regular />}
                                onClick={() => setCowatchGroup(group)}
                            >
                                {t("coWatch.openButton", "Co-watch")}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog
                open={chatGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setChatGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {chatGroup ? `${t("groupChat.title")} — ${chatGroup.name}` : t("groupChat.title")}
                        </DialogTitle>
                        <DialogContent>
                            {chatGroup && <StudyGroupChat groupId={chatGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={eventsGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setEventsGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {eventsGroup ? `${t("groupEvents.title")} — ${eventsGroup.name}` : t("groupEvents.title")}
                        </DialogTitle>
                        <DialogContent>
                            {eventsGroup && <GroupEvents groupId={eventsGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={whiteboardGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setWhiteboardGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {whiteboardGroup ? `${t("whiteboards.title")} — ${whiteboardGroup.name}` : t("whiteboards.title")}
                        </DialogTitle>
                        <DialogContent>
                            {whiteboardGroup && <Whiteboards groupId={whiteboardGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={voiceRoomGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setVoiceRoomGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {voiceRoomGroup ? `${t("voiceRooms.title")} — ${voiceRoomGroup.name}` : t("voiceRooms.title")}
                        </DialogTitle>
                        <DialogContent>
                            {voiceRoomGroup && <VoiceRooms groupId={voiceRoomGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={screenShareGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setScreenShareGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {screenShareGroup ? `${t("screenShares.title")} — ${screenShareGroup.name}` : t("screenShares.title")}
                        </DialogTitle>
                        <DialogContent>
                            {screenShareGroup && <ScreenShares groupId={screenShareGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={cowatchGroup !== null}
                onOpenChange={(_: unknown, d: { open: boolean }) => {
                    if (!d.open) setCowatchGroup(null);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>
                            {cowatchGroup
                                ? `${t("coWatch.title", "Co-watch")} — ${cowatchGroup.name}`
                                : t("coWatch.title", "Co-watch")}
                        </DialogTitle>
                        <DialogContent>
                            {cowatchGroup && <CoWatch groupId={cowatchGroup.id} />}
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}
