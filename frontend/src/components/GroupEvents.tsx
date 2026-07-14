import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Spinner,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import {
    CalendarAdd24Regular,
    CalendarClock24Regular,
    Location24Regular,
    Link24Regular,
    Delete24Regular,
    PeopleAudience24Regular,
} from "@fluentui/react-icons";
import {
    useGroupEvents,
    useCreateGroupEvent,
    useRsvpEvent,
    useEventRsvps,
    useDeleteGroupEvent,
} from "../hooks/useGroupEvents";
import type { GroupEvent } from "../api/groupEvents";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import styles from "./GroupEvents.module.css";

const RSVP_STATUSES = ["GOING", "MAYBE", "NOT_GOING"] as const;

function rsvpBadgeVariant(status: string | null) {
    switch (status) {
        case "GOING":
            return "success" as const;
        case "MAYBE":
            return "warning" as const;
        case "NOT_GOING":
            return "danger" as const;
        default:
            return "neutral" as const;
    }
}

function formatDateTime(iso: string): string {
    try {
        return new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

interface GroupEventsProps {
    groupId: number;
}

export function GroupEvents({ groupId }: GroupEventsProps) {
    const { t } = useTranslation();
    const { data: events, isLoading, isError, refetch } = useGroupEvents(groupId);
    const createMutation = useCreateGroupEvent(groupId);
    const rsvpMutation = useRsvpEvent(groupId);
    const deleteMutation = useDeleteGroupEvent(groupId);

    const [createOpen, setCreateOpen] = useState(false);
    const [attendeesEventId, setAttendeesEventId] = useState<number | null>(
        null,
    );

    const list = events ?? [];

    const handleRsvp = (eventId: number, status: string) => {
        rsvpMutation.mutate({ eventId, data: { status } });
    };

    const handleDelete = (eventId: number) => {
        if (window.confirm(t("groupEvents.deleteConfirm"))) {
            deleteMutation.mutate(eventId);
        }
    };

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>{t("groupEvents.title")}</h2>
                    <p className={styles.panelSubtitle}>{t("groupEvents.subtitle")}</p>
                </div>
                <Button
                    variant="primary"
                    size="small"
                    icon={<CalendarAdd24Regular />}
                    onClick={() => setCreateOpen(true)}
                >
                    {t("groupEvents.createButton")}
                </Button>
            </header>

            {isLoading && (
                <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                    <Spinner label={t("common.loading")} />
                </div>
            )}
            {isError && (
                <ErrorState
                    icon={<CalendarClock24Regular />}
                    title={t("groupEvents.errorTitle")}
                    description={t("groupEvents.errorDescription")}
                    onRetry={() => refetch()}
                    retryLabel={t("common.retry")}
                />
            )}
            {!isLoading && !isError && list.length === 0 && (
                <EmptyState
                    icon={<CalendarClock24Regular />}
                    title={t("groupEvents.noEvents")}
                    description={t("groupEvents.subtitle")}
                />
            )}

            <div className={styles.eventList}>
                {list.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onRsvp={handleRsvp}
                        onAttendees={setAttendeesEventId}
                        onDelete={handleDelete}
                        t={t}
                    />
                ))}
            </div>

            <CreateEventDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={(payload) => {
                    createMutation.mutate(payload, {
                        onSuccess: () => setCreateOpen(false),
                    });
                }}
                loading={createMutation.isPending}
                error={createMutation.isError ? t("groupEvents.createError") : undefined}
                t={t}
            />

            <AttendeesDialog
                groupId={groupId}
                eventId={attendeesEventId}
                onClose={() => setAttendeesEventId(null)}
                t={t}
            />
        </div>
    );
}

interface EventCardProps {
    event: GroupEvent;
    onRsvp: (eventId: number, status: string) => void;
    onAttendees: (eventId: number) => void;
    onDelete: (eventId: number) => void;
    t: ReturnType<typeof useTranslation>["t"];
}

function EventCard({ event, onRsvp, onAttendees, onDelete, t }: EventCardProps) {
    return (
        <Card padding="md" className={styles.eventCard}>
            <div className={styles.eventTop}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <Badge variant="accent" size="small">
                    {formatDateTime(event.startTime)}
                </Badge>
            </div>

            {event.description && (
                <p className={styles.eventDesc}>{event.description}</p>
            )}

            <div className={styles.eventMeta}>
                {event.location && (
                    <div className={styles.metaRow}>
                        <Location24Regular className={styles.metaIcon} />
                        <span className={styles.metaValue}>{event.location}</span>
                    </div>
                )}
                {event.meetingUrl && (
                    <div className={styles.metaRow}>
                        <Link24Regular className={styles.metaIcon} />
                        <a
                            className={styles.meetingLink}
                            href={event.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("groupEvents.meetingLink")}
                            <span className="visually-hidden">{t("a11y.opensInNewWindow")}</span>
                        </a>
                    </div>
                )}
            </div>

            <div className={styles.rsvpSummary}>
                <Badge variant="success" size="small">
                    {t("groupEvents.going")}: {event.goingCount}
                </Badge>
                <Badge variant="warning" size="small">
                    {t("groupEvents.maybe")}: {event.maybeCount}
                </Badge>
                <Badge variant="danger" size="small">
                    {t("groupEvents.not_going")}: {event.notGoingCount}
                </Badge>
            </div>

            <div className={styles.rsvpActions}>
                {RSVP_STATUSES.map((status) => (
                    <Button
                        key={status}
                        variant={
                            event.viewerStatus === status ? "primary" : "outline"
                        }
                        size="small"
                        onClick={() => onRsvp(event.id, status)}
                    >
                        {t(`groupEvents.${status.toLowerCase()}`)}
                    </Button>
                ))}
            </div>

            <div className={styles.eventActions}>
                <Button
                    variant="subtle"
                    size="small"
                    icon={<PeopleAudience24Regular />}
                    onClick={() => onAttendees(event.id)}
                >
                    {t("groupEvents.attendees")}
                </Button>
                <Button
                    variant="ghost"
                    size="small"
                    icon={<Delete24Regular />}
                    onClick={() => onDelete(event.id)}
                >
                    {t("groupEvents.deleteEvent")}
                </Button>
            </div>
        </Card>
    );
}

interface CreateEventDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (payload: {
        title: string;
        description: string;
        startTime: string;
        endTime?: string;
        location?: string;
        meetingUrl?: string;
    }) => void;
    loading: boolean;
    error?: string;
    t: ReturnType<typeof useTranslation>["t"];
}

function CreateEventDialog({
    open,
    onClose,
    onCreate,
    loading,
    error,
    t,
}: CreateEventDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [meetingUrl, setMeetingUrl] = useState("");

    const handleSubmit = () => {
        if (!title.trim() || !startTime) return;
        onCreate({
            title: title.trim(),
            description: description.trim(),
            startTime,
            endTime: endTime || undefined,
            location: location.trim() || undefined,
            meetingUrl: meetingUrl.trim() || undefined,
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open) onClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("groupEvents.createTitle")}</DialogTitle>
                    <DialogContent>
                        <div className={styles.form}>
                            <Input
                                label={t("groupEvents.fieldName")}
                                placeholder={t("groupEvents.fieldNamePlaceholder")}
                                value={title}
                                onChange={(_, d) => setTitle(d.value)}
                            />
                            <Input
                                label={t("groupEvents.fieldDescription")}
                                placeholder={t("groupEvents.fieldDescriptionPlaceholder")}
                                value={description}
                                onChange={(_, d) => setDescription(d.value)}
                            />
                            <div className={styles.formRow}>
                                <Input
                                    label={t("groupEvents.fieldStart")}
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(_, d) => setStartTime(d.value)}
                                />
                                <Input
                                    label={t("groupEvents.fieldEnd")}
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(_, d) => setEndTime(d.value)}
                                />
                            </div>
                            <Input
                                label={t("groupEvents.fieldLocation")}
                                placeholder={t("groupEvents.fieldLocationPlaceholder")}
                                value={location}
                                onChange={(_, d) => setLocation(d.value)}
                            />
                            <Input
                                label={t("groupEvents.fieldMeetingUrl")}
                                placeholder={t("groupEvents.fieldMeetingUrlPlaceholder")}
                                value={meetingUrl}
                                onChange={(_, d) => setMeetingUrl(d.value)}
                            />
                            {error && (
                                <p className={styles.formError} role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={onClose}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            loading={loading}
                            disabled={!title.trim() || !startTime}
                            onClick={handleSubmit}
                        >
                            {t("groupEvents.createConfirm")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

interface AttendeesDialogProps {
    groupId: number;
    eventId: number | null;
    onClose: () => void;
    t: ReturnType<typeof useTranslation>["t"];
}

function AttendeesDialog({
    groupId,
    eventId,
    onClose,
    t,
}: AttendeesDialogProps) {
    const { data: rsvps, isLoading } = useEventRsvps(
        eventId != null ? groupId : null,
        eventId,
    );
    const open = eventId != null;
    const list = rsvps ?? [];

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open) onClose();
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("groupEvents.attendeesTitle")}</DialogTitle>
                    <DialogContent>
                        {isLoading && (
                            <div role="status" aria-live="polite" aria-label={t("common.loading")}>
                                <Spinner label={t("common.loading")} />
                            </div>
                        )}
                        {!isLoading && list.length === 0 && (
                            <p className={styles.attendeesEmpty}>
                                {t("groupEvents.attendeesEmpty")}
                            </p>
                        )}
                        <ul className={styles.attendeesList}>
                            {list.map((rsvp) => (
                                <li key={rsvp.id} className={styles.attendeeRow}>
                                    <span className={styles.attendeeName}>
                                        {rsvp.userName}
                                    </span>
                                    <Badge
                                        variant={rsvpBadgeVariant(rsvp.status)}
                                        size="small"
                                    >
                                        {t(`groupEvents.${rsvp.status.toLowerCase()}`)}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="subtle" onClick={onClose}>
                            {t("common.close")}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
