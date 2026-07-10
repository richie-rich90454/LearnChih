import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import {
    PeopleCommunity24Regular,
    Add24Regular,
    CalendarClock24Regular,
    People24Regular,
} from "@fluentui/react-icons";
import {
    useCohorts,
    useCreateCohort,
    useJoinCohort,
    useLeaveCohort,
    useCohortMembers,
} from "@/hooks/useCohorts";
import type { Cohort, CreateCohortRequest } from "@/api/cohorts";
import Seo from "@/components/Seo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import styles from "./CohortsPage.module.css";

function formatDate(value: string | null, t: (k: string) => string): string {
    if (!value) return t("cohorts.notSet");
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(d);
}

function roleBadgeVariant(role: string | null) {
    if (role === "LEADER") return "accent" as const;
    if (role === "MEMBER") return "success" as const;
    return "neutral" as const;
}

/**
 * Cohort-based study groups page (F40). Lists every cohort with member count,
 * the viewer's role, and a create/join/leave flow. The "Members" action opens
 * a roster dialog showing leaders and members.
 */
export default function CohortsPage() {
    const { t } = useTranslation();
    const cohortsQuery = useCohorts();
    const createMutation = useCreateCohort();
    const joinMutation = useJoinCohort();
    const leaveMutation = useLeaveCohort();

    const [createOpen, setCreateOpen] = useState(false);
    const [membersCohort, setMembersCohort] = useState<Cohort | null>(null);

    const cohorts = cohortsQuery.data ?? [];
    const busy = createMutation.isPending || joinMutation.isPending || leaveMutation.isPending;

    return (
        <div className={styles.page}>
            <Seo
                title={`${t("cohorts.title")} — LernChih`}
                description={t("cohorts.subtitle")}
                canonicalPath="/cohorts"
            />
            <header className={styles.pageHeader}>
                <div className={styles.headerLead}>
                    <span className={styles.headerIcon} aria-hidden="true">
                        <PeopleCommunity24Regular />
                    </span>
                    <div>
                        <h1 className={styles.title}>{t("cohorts.title")}</h1>
                        <p className={styles.subtitle}>{t("cohorts.subtitle")}</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    icon={<Add24Regular />}
                    onClick={() => setCreateOpen(true)}
                >
                    {t("cohorts.createButton")}
                </Button>
            </header>

            {cohortsQuery.isError && (
                <ErrorState
                    icon={<PeopleCommunity24Regular />}
                    title={t("cohorts.errorTitle")}
                    description={t("cohorts.errorDescription")}
                    onRetry={() => cohortsQuery.refetch()}
                    retryLabel={t("common.retry")}
                />
            )}

            {cohortsQuery.isLoading && <Spinner label={t("common.loading")} />}

            {!cohortsQuery.isLoading && !cohortsQuery.isError && cohorts.length === 0 && (
                <EmptyState
                    icon={<PeopleCommunity24Regular />}
                    title={t("cohorts.emptyTitle")}
                    description={t("cohorts.emptyDescription")}
                />
            )}

            {cohorts.length > 0 && (
                <ul className={styles.grid} aria-label={t("cohorts.title")}>
                    {cohorts.map((c) => {
                        const isMember = c.role !== null;
                        const full =
                            c.maxMembers != null && c.memberCount >= c.maxMembers;
                        return (
                            <li key={c.id}>
                                <Card padding="lg" className={styles.cohortCard}>
                                    <div className={styles.cardTop}>
                                        <h2 className={styles.cohortName}>{c.name}</h2>
                                        <Badge variant={roleBadgeVariant(c.role)} size="small">
                                            {c.role
                                                ? t(`cohorts.role.${c.role.toLowerCase()}`)
                                                : t("cohorts.role.visitor")}
                                        </Badge>
                                    </div>

                                    {c.description && (
                                        <p className={styles.cohortDesc}>{c.description}</p>
                                    )}

                                    <dl className={styles.meta}>
                                        <div className={styles.metaRow}>
                                            <dt className={styles.metaLabel}>
                                                <People24Regular className={styles.metaIcon} aria-hidden="true" />
                                                {t("cohorts.memberCount")}
                                            </dt>
                                            <dd className={styles.metaValue}>
                                                {c.memberCount}
                                                {c.maxMembers != null ? ` / ${c.maxMembers}` : ""}
                                            </dd>
                                        </div>
                                        <div className={styles.metaRow}>
                                            <dt className={styles.metaLabel}>
                                                <CalendarClock24Regular className={styles.metaIcon} aria-hidden="true" />
                                                {t("cohorts.window")}
                                            </dt>
                                            <dd className={styles.metaValue}>
                                                {formatDate(c.startDate, t)} — {formatDate(c.endDate, t)}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className={styles.cardActions}>
                                        {!isMember && (
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => joinMutation.mutate(c.id)}
                                                disabled={busy || full}
                                                loading={joinMutation.isPending}
                                            >
                                                {full ? t("cohorts.full") : t("cohorts.join")}
                                            </Button>
                                        )}
                                        {isMember && (
                                            <Button
                                                variant="subtle"
                                                size="small"
                                                onClick={() => leaveMutation.mutate(c.id)}
                                                disabled={busy}
                                                loading={leaveMutation.isPending}
                                            >
                                                {t("cohorts.leave")}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="small"
                                            icon={<People24Regular />}
                                            onClick={() => setMembersCohort(c)}
                                        >
                                            {t("cohorts.viewMembers")}
                                        </Button>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}

            {joinMutation.isError && (
                <MessageBar intent="error">
                    <MessageBarBody>{t("cohorts.joinError")}</MessageBarBody>
                </MessageBar>
            )}

            <CreateCohortDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={(payload) =>
                    createMutation.mutate(payload, {
                        onSuccess: () => setCreateOpen(false),
                    })
                }
                pending={createMutation.isPending}
                error={createMutation.isError ? t("cohorts.createError") : null}
            />

            <MembersDialog
                cohort={membersCohort}
                onOpenChange={(open) => {
                    if (!open) setMembersCohort(null);
                }}
            />
        </div>
    );
}

interface CreateCohortDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: CreateCohortRequest) => void;
    pending: boolean;
    error: string | null;
}

function CreateCohortDialog({
    open,
    onOpenChange,
    onSubmit,
    pending,
    error,
}: CreateCohortDialogProps) {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [maxMembers, setMaxMembers] = useState("");

    const reset = () => {
        setName("");
        setDescription("");
        setSubjectId("");
        setStartDate("");
        setEndDate("");
        setMaxMembers("");
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const payload: CreateCohortRequest = {
            name: name.trim(),
            description: description.trim() || undefined,
            subjectId: subjectId.trim() ? Number(subjectId) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            maxMembers: maxMembers.trim() ? Number(maxMembers) : null,
        };
        onSubmit(payload);
        reset();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, d) => {
                if (!d.open) reset();
                onOpenChange(d.open);
            }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>{t("cohorts.createTitle")}</DialogTitle>
                    <DialogContent>
                        <form
                            className={styles.form}
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                        >
                            <Input
                                label={t("cohorts.fieldName")}
                                value={name}
                                onChange={(_, d) => setName(d.value)}
                                placeholder={t("cohorts.fieldNamePlaceholder")}
                                required
                            />
                            <Input
                                label={t("cohorts.fieldDescription")}
                                value={description}
                                onChange={(_, d) => setDescription(d.value)}
                                placeholder={t("cohorts.fieldDescriptionPlaceholder")}
                            />
                            <Input
                                label={t("cohorts.fieldSubjectId")}
                                value={subjectId}
                                onChange={(_, d) => setSubjectId(d.value)}
                                placeholder={t("cohorts.fieldSubjectIdPlaceholder")}
                                type="number"
                                helperText={t("cohorts.fieldSubjectIdHelper")}
                            />
                            <div className={styles.dateRow}>
                                <Input
                                    label={t("cohorts.fieldStart")}
                                    type="date"
                                    value={startDate}
                                    onChange={(_, d) => setStartDate(d.value)}
                                />
                                <Input
                                    label={t("cohorts.fieldEnd")}
                                    type="date"
                                    value={endDate}
                                    onChange={(_, d) => setEndDate(d.value)}
                                />
                            </div>
                            <Input
                                label={t("cohorts.fieldMaxMembers")}
                                value={maxMembers}
                                onChange={(_, d) => setMaxMembers(d.value)}
                                placeholder={t("cohorts.fieldMaxMembersPlaceholder")}
                                type="number"
                                helperText={t("cohorts.fieldMaxMembersHelper")}
                            />
                            {error && (
                                <MessageBar intent="error">
                                    <MessageBarBody>{error}</MessageBarBody>
                                </MessageBar>
                            )}
                            <DialogActions className={styles.dialogActions}>
                                <Button
                                    variant="subtle"
                                    onClick={() => onOpenChange(false)}
                                    disabled={pending}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={pending || !name.trim()}
                                    loading={pending}
                                >
                                    {t("cohorts.createConfirm")}
                                </Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

interface MembersDialogProps {
    cohort: Cohort | null;
    onOpenChange: (open: boolean) => void;
}

function MembersDialog({ cohort, onOpenChange }: MembersDialogProps) {
    const { t } = useTranslation();
    const membersQuery = useCohortMembers(cohort?.id ?? null);
    const members = membersQuery.data ?? [];

    return (
        <Dialog
            open={cohort !== null}
            onOpenChange={(_, d) => onOpenChange(d.open)}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>
                        {cohort
                            ? `${t("cohorts.membersTitle")} — ${cohort.name}`
                            : t("cohorts.membersTitle")}
                    </DialogTitle>
                    <DialogContent>
                        {membersQuery.isLoading && <Spinner label={t("common.loading")} />}
                        {membersQuery.isError && (
                            <MessageBar intent="error">
                                <MessageBarBody>{t("cohorts.membersError")}</MessageBarBody>
                            </MessageBar>
                        )}
                        {!membersQuery.isLoading && !membersQuery.isError && members.length === 0 && (
                            <p className={styles.membersEmpty}>{t("cohorts.membersEmpty")}</p>
                        )}
                        {members.length > 0 && (
                            <ul className={styles.membersList}>
                                {members.map((m) => (
                                    <li key={m.id} className={styles.memberRow}>
                                        <span className={styles.memberName}>{m.userName}</span>
                                        <Badge
                                            variant={roleBadgeVariant(m.role)}
                                            size="small"
                                        >
                                            {t(`cohorts.role.${m.role.toLowerCase()}`)}
                                        </Badge>
                                        <span className={styles.memberSince}>
                                            {t("cohorts.joinedOn", {
                                                date: formatDate(m.joinedAt, t),
                                            })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
