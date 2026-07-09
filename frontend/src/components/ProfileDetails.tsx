import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Field,
    Spinner,
} from "@fluentui/react-components";
import { Edit24Regular } from "@fluentui/react-icons";
import { useUpdateProfile } from "@/hooks/useProfile";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import styles from "./ProfileDetails.module.css";

interface ProfileDetailsProps {
    profile: UserProfile;
    /** Whether the viewer is the profile owner and may edit details. */
    editable: boolean;
}

interface DetailRow {
    label: string;
    value: string | null;
}

/**
 * Displays a user's profile status, pronouns, and timezone (F36). The owner
 * can edit all three through a dialog; other viewers see a read-only card.
 * The card renders whenever the owner can edit or any detail is set.
 */
export function ProfileDetails({ profile, editable }: ProfileDetailsProps) {
    const { t } = useTranslation();
    const updateProfile = useUpdateProfile();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [status, setStatus] = useState<string>(profile.status ?? "");
    const [pronouns, setPronouns] = useState<string>(profile.pronouns ?? "");
    const [timezone, setTimezone] = useState<string>(profile.timezone ?? "");

    const rows: DetailRow[] = [
        { label: t("profileDetails.status"), value: profile.status },
        { label: t("profileDetails.pronouns"), value: profile.pronouns },
        { label: t("profileDetails.timezone"), value: profile.timezone },
    ];

    const hasAnyDetail = rows.some((r) => r.value);
    if (!editable && !hasAnyDetail) {
        return null;
    }

    const openEdit = () => {
        setStatus(profile.status ?? "");
        setPronouns(profile.pronouns ?? "");
        setTimezone(profile.timezone ?? "");
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        updateProfile.mutate(
            {
                name: profile.name,
                bio: profile.bio ?? "",
                status: status.trim(),
                pronouns: pronouns.trim(),
                timezone: timezone.trim(),
            },
            { onSuccess: () => setDialogOpen(false) },
        );
    };

    return (
        <Card padding="lg" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("profileDetails.title")}</h2>
                {editable && (
                    <Button
                        variant="subtle"
                        icon={<Edit24Regular />}
                        onClick={openEdit}
                    >
                        {t("profileDetails.edit")}
                    </Button>
                )}
            </div>

            {hasAnyDetail ? (
                <dl className={styles.details}>
                    {rows.map(
                        (row) =>
                            row.value && (
                                <div key={row.label} className={styles.row}>
                                    <dt className={styles.rowLabel}>{row.label}</dt>
                                    <dd className={styles.rowValue}>{row.value}</dd>
                                </div>
                            ),
                    )}
                </dl>
            ) : (
                <p className={styles.empty}>{t("profileDetails.empty")}</p>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("profileDetails.editTitle")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.form}>
                                <Field label={t("profileDetails.status")}>
                                    <Input
                                        value={status}
                                        onChange={(_e, data) => setStatus(data.value)}
                                        placeholder={t("profileDetails.statusPlaceholder")}
                                    />
                                </Field>
                                <Field label={t("profileDetails.pronouns")}>
                                    <Input
                                        value={pronouns}
                                        onChange={(_e, data) => setPronouns(data.value)}
                                        placeholder={t("profileDetails.pronounsPlaceholder")}
                                    />
                                </Field>
                                <Field
                                    label={t("profileDetails.timezone")}
                                    hint={t("profileDetails.timezoneHint")}
                                >
                                    <Input
                                        value={timezone}
                                        onChange={(_e, data) => setTimezone(data.value)}
                                        placeholder="Asia/Shanghai"
                                    />
                                </Field>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="subtle" onClick={() => setDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? (
                                    <Spinner size="tiny" />
                                ) : (
                                    t("common.save")
                                )}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </Card>
    );
}

export default ProfileDetails;
