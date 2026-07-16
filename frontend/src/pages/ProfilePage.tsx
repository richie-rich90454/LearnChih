import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Textarea,
    Avatar,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Spinner,
    MessageBar,
    MessageBarBody,
    Field,
    Switch,
    Label,
} from "@fluentui/react-components";
import { Edit24Regular, Add24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import {
    useMyProfile,
    useUserProfile,
    useUpdateProfile,
    useUpdateSubjects,
    useAddSocial,
    useRemoveSocial,
} from "@/hooks/useProfile";
import { useNotificationPreferences } from "@/hooks/usePreferences";
import { useChangeEmail } from "@/hooks/usePassword";
import type { UserProfile } from "@/types";
import Seo from "@/components/Seo";
import { SkeletonLine, SkeletonCard } from "@/components/Skeleton";
import { BadgesWidget } from "@/components/BadgesWidget";
import { FollowButton } from "@/components/FollowButton";
import { EndorsementBadge } from "@/components/EndorsementBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Portfolio } from "@/components/Portfolio";
import { ProfileDetails } from "@/components/ProfileDetails";
import { FeaturedBadges } from "@/components/FeaturedBadges";
import { FriendsList } from "@/components/FriendsList";
import { AddFriendButton } from "@/components/AddFriendButton";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import { useExportUserData, useDeleteUserAccount } from "@/hooks/useGdpr";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import styles from "./Detail.module.css";

const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Computer Science",
    "Chemistry",
    "Biology",
    "Economics",
    "English",
    "History",
    "Other",
];
const SOCIAL_TYPES = ["GITHUB", "LINKEDIN", "TWITTER", "WEBSITE", "OTHER"];

export default function ProfilePage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const isOwnProfile = !id;

    const profileQuery = isOwnProfile ? useMyProfile() : useUserProfile(id);
    const { data: profile, isLoading, isError, refetch } = profileQuery;

    const updateProfile = useUpdateProfile();
    const updateSubjects = useUpdateSubjects();
    const addSocial = useAddSocial();
    const removeSocial = useRemoveSocial();
    const { preferences, setPreferences } = useNotificationPreferences();
    const changeEmail = useChangeEmail();
    const exportData = useExportUserData();
    const deleteAccount = useDeleteUserAccount();

    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>("");
    const [editBio, setEditBio] = useState<string>("");

    const [subjectsDialogOpen, setSubjectsDialogOpen] = useState<boolean>(false);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const [socialDialogOpen, setSocialDialogOpen] = useState<boolean>(false);
    const [socialType, setSocialType] = useState<string>("GITHUB");
    const [socialLabel, setSocialLabel] = useState<string>("");
    const [socialUrl, setSocialUrl] = useState<string>("");

    const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
    const [newEmail, setNewEmail] = useState<string>("");
    const [emailPassword, setEmailPassword] = useState<string>("");

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Card padding="lg" className={styles.header}>
                    <SkeletonLine width="20%" />
                    <SkeletonLine width="40%" />
                    <SkeletonLine width="30%" />
                </Card>
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.empty} role="alert">
                <h1 className={styles.threadHeading}>{t("profile.loadError")}</h1>
                <p className={styles.emptyText}>{t("profile.loadErrorDescription")}</p>
                <Button variant="primary" onClick={() => refetch()}>
                    {t("common.retry")}
                </Button>
            </div>
        );
    }

    const handleEditOpen = () => {
        setEditName(profile?.name || "");
        setEditBio(profile?.bio || "");
        setEditDialogOpen(true);
    };

    const handleEditSave = () => {
        updateProfile.mutate(
            { name: editName, bio: editBio },
            {
                onSuccess: () => setEditDialogOpen(false),
            },
        );
    };

    const handleSubjectsOpen = () => {
        setSelectedSubjects(
            profile?.subjects?.map((s: string | { name: string }) =>
                typeof s === "string" ? s : s.name,
            ) || [],
        );
        setSubjectsDialogOpen(true);
    };

    const handleSubjectsSave = () => {
        updateSubjects.mutate(selectedSubjects, {
            onSuccess: () => setSubjectsDialogOpen(false),
        });
    };

    const handleAddSocial = () => {
        addSocial.mutate(
            { platform: socialType, url: socialUrl },
            {
                onSuccess: () => {
                    setSocialDialogOpen(false);
                    setSocialLabel("");
                    setSocialUrl("");
                },
            },
        );
    };

    const handleRemoveSocial = (socialId: number) => {
        removeSocial.mutate(socialId);
    };

    const handleChangeEmail = () => {
        changeEmail.mutate(
            { newEmail, password: emailPassword },
            {
                onSuccess: () => {
                    setEmailDialogOpen(false);
                    setNewEmail("");
                    setEmailPassword("");
                },
            },
        );
    };

    return (
        <div className={styles.container}>
            <Seo
                title={`${profile?.name || "Profile"} — LernChih`}
                description={`${profile?.name || "User"}'s profile on LernChih.`}
                canonicalPath={isOwnProfile ? "/profile" : `/profile/${id}`}
                robots="noindex, follow"
            />
            {/* Profile header */}
            <Card padding="lg" className={styles.header}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarSection}>
                        <Avatar name={profile?.name || "User"} size={72} />
                        <Badge appearance="filled" color="brand" className={styles.creditsBadge}>
                            {profile?.credits ?? 0}
                        </Badge>
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>{profile?.name || "User"}</h1>
                        <p className={styles.profileEmail}>{profile?.email}</p>
                        <Badge variant="neutral">{profile?.role || "STUDENT"}</Badge>
                        {profile?.bio && <p className={styles.profileBio}>{profile.bio}</p>}
                    </div>
                    <div className={styles.profileActions}>
                        {isOwnProfile ? (
                            <Button
                                variant="outline"
                                icon={<Edit24Regular />}
                                onClick={handleEditOpen}
                            >
                                {t("profile.edit")}
                            </Button>
                        ) : (
                            profile && (
                                <>
                                    <FollowButton userId={profile.id ?? Number(id)} />
                                    <AddFriendButton userId={profile.id} />
                                </>
                            )
                        )}
                        {profile?.id && <EndorsementBadge userId={profile.id} />}
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statTile}>
                        <span className={styles.statValue}>{profile?.credits ?? 0}</span>
                        <span className={styles.statLabel}>{t("profile.credits")}</span>
                    </div>
                    <div className={styles.statTile}>
                        <span className={styles.statValue}>{profile?.resourceCount ?? 0}</span>
                        <span className={styles.statLabel}>{t("profile.resources")}</span>
                    </div>
                    <div className={styles.statTile}>
                        <span className={styles.statValue}>{profile?.upvoteCount ?? 0}</span>
                        <span className={styles.statLabel}>{t("profile.upvotes")}</span>
                    </div>
                    <div className={styles.statTile}>
                        <span className={styles.statValue}>
                            {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "—"}
                        </span>
                        <span className={styles.statLabel}>{t("profile.joined")}</span>
                    </div>
                </div>
            </Card>

            {/* Subjects */}
            <Card padding="lg" className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t("profile.subjects")}</h2>
                    {isOwnProfile && (
                        <Button
                            variant="subtle"
                            icon={<Edit24Regular />}
                            onClick={handleSubjectsOpen}
                        >
                            {t("profile.edit")}
                        </Button>
                    )}
                </div>
                <div className={styles.tagsRow}>
                    {(profile?.subjects?.length ?? 0) > 0 ? (
                        profile!.subjects.map((s: string | { name: string }, i: number) => (
                            <Badge key={i} variant="neutral">
                                {typeof s === "string" ? s : s.name}
                            </Badge>
                        ))
                    ) : (
                        <p className={styles.emptyText}>{t("profile.noSubjects")}</p>
                    )}
                </div>
            </Card>

            {/* Social links */}
            <Card padding="lg" className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t("profile.socialLinks")}</h2>
                    {isOwnProfile && (
                        <Button
                            variant="subtle"
                            icon={<Add24Regular />}
                            onClick={() => setSocialDialogOpen(true)}
                        >
                            {t("profile.add")}
                        </Button>
                    )}
                </div>
                <div className={styles.socialRow}>
                    {(profile?.socials?.length ?? 0) > 0 ? (
                        profile!.socials.map((social) => (
                            <div key={social.id} className={styles.socialItem}>
                                <Badge appearance="outline">{social.platform}</Badge>
                                <a
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                >
                                    {social.url}
                                    <span className="visually-hidden">{t("a11y.opensInNewWindow")}</span>
                                </a>
                                {isOwnProfile && (
                                    <Button
                                        variant="subtle"
                                        icon={<Dismiss24Regular />}
                                        size="small"
                                        aria-label={t("profile.removeSocialLink")}
                                        onClick={() => handleRemoveSocial(social.id)}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyText}>{t("profile.noSocialLinks")}</p>
                    )}
                </div>
            </Card>

            {/* Portfolio */}
            {profile?.id && (
                <Portfolio userId={profile.id} editable={isOwnProfile} />
            )}

            {/* Profile details: status, pronouns, timezone (F36) */}
            {profile && (
                <ProfileDetails profile={profile} editable={isOwnProfile} />
            )}

            {/* Featured badges showcase (F37) */}
            {profile?.id && (
                <FeaturedBadges userId={profile.id} editable={isOwnProfile} />
            )}

            {/* Friends / study-buddies list (F38) */}
            {isOwnProfile && <FriendsList />}

            {/* Notification preferences */}
            {isOwnProfile && (
                <Card padding="lg" className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t("profile.notificationPreferences")}</h2>
                    </div>
                    <div className={styles.stack}>
                        <div className={styles.prefRow}>
                            <Label htmlFor="email-notifications" className={styles.prefLabelTitle}>
                                {t("profile.emailNotifications")}
                            </Label>
                            <Switch
                                id="email-notifications"
                                checked={preferences.emailNotifications}
                                onChange={(_, data) =>
                                    setPreferences({
                                        ...preferences,
                                        emailNotifications: data.checked as boolean,
                                    })
                                }
                            />
                        </div>
                        <div className={styles.prefRow}>
                            <Label htmlFor="push-notifications" className={styles.prefLabelTitle}>
                                {t("profile.pushNotifications")}
                            </Label>
                            <Switch
                                id="push-notifications"
                                checked={preferences.pushNotifications}
                                onChange={(_, data) =>
                                    setPreferences({
                                        ...preferences,
                                        pushNotifications: data.checked as boolean,
                                    })
                                }
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Account security */}
            {isOwnProfile && (
                <Card padding="lg" className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t("profile.accountSecurity")}</h2>
                    </div>
                    <div className={styles.stack}>
                        <div className={styles.prefRow}>
                            <div className={styles.prefLabel}>
                                <span className={styles.prefLabelTitle}>{t("profile.emailAddress")}</span>
                                <span className={styles.prefLabelDesc}>{profile?.email}</span>
                            </div>
                            <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
                                {t("profile.changeEmail")}
                            </Button>
                        </div>
                        <TwoFactorSetup />
                    </div>
                </Card>
            )}

            {/* Data & privacy */}
            {isOwnProfile && (
                <Card padding="lg" className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t("profile.dataPrivacy")}</h2>
                    </div>
                    <div className={styles.stack}>
                        <div className={styles.prefRow}>
                            <div className={styles.prefLabel}>
                                <span className={styles.prefLabelTitle}>{t("profile.exportMyData")}</span>
                                <span className={styles.prefLabelDesc}>
                                    {t("profile.exportDescription")}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => exportData.mutate()}
                                disabled={exportData.isPending}
                                /* B-ui-175: preserve accessible name while
                                   the pending Spinner replaces the label. */
                                aria-label={
                                    exportData.isPending
                                        ? t("profile.export")
                                        : undefined
                                }
                            >
                                {exportData.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("profile.export")}
                            </Button>
                        </div>
                        <div className={styles.prefRow}>
                            <div className={styles.prefLabel}>
                                <span className={styles.prefLabelTitle}>{t("profile.deleteMyAccount")}</span>
                                <span className={styles.prefLabelDesc}>
                                    {t("profile.deleteDescription")}
                                </span>
                            </div>
                            <ConfirmDialog
                                trigger={
                                    <Button appearance="primary" color="danger">
                                        {t("profile.deleteAccount")}
                                    </Button>
                                }
                                title={t("profile.deleteAccountTitle")}
                                content={t("profile.deleteAccountContent")}
                                confirmLabel={t("profile.delete")}
                                destructive
                                onConfirm={() => deleteAccount.mutate()}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Badges */}
            <Card padding="lg" className={styles.sectionCard}>
                <BadgesWidget userId={profile?.id ?? Number(id)} />
            </Card>

            {/* Edit profile dialog */}
            <Dialog
                open={editDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setEditDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("profile.editProfile")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.dialogForm}>
                                <Input
                                    label={t("profile.name")}
                                    autoComplete="name"
                                    value={editName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setEditName(e.target.value)
                                    }
                                    aria-required="true"
                                />
                                <Field label={t("profile.bio")}>
                                    <Textarea
                                        value={editBio}
                                        aria-label={t("profile.bio")}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setEditBio(e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="subtle" onClick={() => setEditDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleEditSave}
                                disabled={updateProfile.isPending}
                                aria-label={
                                    updateProfile.isPending
                                        ? t("common.save")
                                        : undefined
                                }
                            >
                                {updateProfile.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("common.save")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Edit subjects dialog */}
            <Dialog
                open={subjectsDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setSubjectsDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("profile.editSubjects")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.tagsRow}>
                                {SUBJECTS.map((s) => {
                                    const isSelected = selectedSubjects.includes(s);
                                    return (
                                        <Badge
                                            key={s}
                                            variant={isSelected ? "accent" : "neutral"}
                                            className={styles.selectableChip}
                                            onClick={() => {
                                                setSelectedSubjects((prev) =>
                                                    isSelected
                                                        ? prev.filter((x) => x !== s)
                                                        : [...prev, s],
                                                );
                                            }}
                                        >
                                            {s}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="subtle" onClick={() => setSubjectsDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubjectsSave}
                                disabled={updateSubjects.isPending}
                                aria-label={
                                    updateSubjects.isPending
                                        ? t("common.save")
                                        : undefined
                                }
                            >
                                {updateSubjects.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("common.save")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Add social dialog */}
            <Dialog
                open={socialDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setSocialDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("profile.addSocialLink")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.dialogForm}>
                                <Select
                                    label={t("profile.type")}
                                    value={socialType}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setSocialType(e.target.value)
                                    }
                                >
                                    {SOCIAL_TYPES.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    label={t("profile.label")}
                                    value={socialLabel}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setSocialLabel(e.target.value)
                                    }
                                    placeholder={t("profile.labelPlaceholder")}
                                />
                                <Input
                                    label={t("profile.url")}
                                    value={socialUrl}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setSocialUrl(e.target.value)
                                    }
                                    placeholder={t("profile.urlPlaceholder")}
                                    aria-required="true"
                                />
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="subtle" onClick={() => setSocialDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddSocial}
                                disabled={addSocial.isPending || !socialUrl.trim()}
                                aria-label={
                                    addSocial.isPending
                                        ? t("profile.add")
                                        : undefined
                                }
                            >
                                {addSocial.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("profile.add")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Change email dialog */}
            <Dialog
                open={emailDialogOpen}
                onOpenChange={(_: unknown, d: { open: boolean }) => setEmailDialogOpen(d.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t("profile.changeEmailTitle")}</DialogTitle>
                        <DialogContent>
                            <div className={styles.dialogForm}>
                                <Input
                                    label={t("profile.newEmail")}
                                    type="email"
                                    autoComplete="email"
                                    value={newEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setNewEmail(e.target.value)
                                    }
                                    placeholder={t("profile.newEmailPlaceholder")}
                                    aria-required="true"
                                />
                                <Input
                                    label={t("profile.currentPassword")}
                                    type="password"
                                    autoComplete="current-password"
                                    value={emailPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setEmailPassword(e.target.value)
                                    }
                                    placeholder={t("profile.currentPasswordPlaceholder")}
                                    aria-required="true"
                                />
                                {changeEmail.isError && (
                                    <MessageBar intent="error">
                                        <MessageBarBody>
                                            {t("profile.changeEmailError")}
                                        </MessageBarBody>
                                    </MessageBar>
                                )}
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="subtle" onClick={() => setEmailDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleChangeEmail}
                                disabled={
                                    changeEmail.isPending ||
                                    !newEmail.trim() ||
                                    !emailPassword.trim()
                                }
                                aria-label={
                                    changeEmail.isPending
                                        ? t("profile.changeEmail")
                                        : undefined
                                }
                            >
                                {changeEmail.isPending ? <Spinner size="tiny" aria-hidden="true" /> : t("profile.changeEmail")}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
}
