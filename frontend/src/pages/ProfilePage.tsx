import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Card,
  Badge,
  Button,
  Avatar,
  Input,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
  MessageBar,
  MessageBarBody,
  Field,
  Select,
  Switch,
  Label,
  Text,
} from '@fluentui/react-components'
import { Edit24Regular, Add24Regular, Dismiss24Regular } from '@fluentui/react-icons'
import { useMyProfile, useUserProfile, useUpdateProfile, useUpdateSubjects, useAddSocial, useRemoveSocial } from '../hooks/useProfile'
import { useNotificationPreferences } from '../hooks/usePreferences'
import { useChangeEmail } from '../hooks/usePassword'
import type { UserProfile } from '../types'
import Seo from '../components/Seo'
import { SkeletonLine, SkeletonCard } from '../components/Skeleton'
import { BadgesWidget } from '../components/BadgesWidget'
import { FollowButton } from '../components/FollowButton'
import { EndorsementBadge } from '../components/EndorsementBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import TwoFactorSetup from '../components/TwoFactorSetup'
import { useExportUserData, useDeleteUserAccount } from '../hooks/useGdpr'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '700px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingHorizontalXL,
  },
  avatarSection: {
    position: 'relative',
  },
  creditsBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  sectionCard: {
    padding: tokens.spacingHorizontalL,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalM,
  },
  tagsRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  socialRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  socialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
})

const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Economics', 'English', 'History', 'Other']
const SOCIAL_TYPES = ['GITHUB', 'LINKEDIN', 'TWITTER', 'WEBSITE', 'OTHER']

export default function ProfilePage() {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const isOwnProfile = !id

  const profileQuery = isOwnProfile ? useMyProfile() : useUserProfile(id)
  const { data: profile, isLoading, isError, refetch } = profileQuery

  const updateProfile = useUpdateProfile()
  const updateSubjects = useUpdateSubjects()
  const addSocial = useAddSocial()
  const removeSocial = useRemoveSocial()
  const { preferences, setPreferences } = useNotificationPreferences()
  const changeEmail = useChangeEmail()
  const exportData = useExportUserData()
  const deleteAccount = useDeleteUserAccount()

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
  const [editName, setEditName] = useState<string>('')
  const [editBio, setEditBio] = useState<string>('')

  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState<boolean>(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const [socialDialogOpen, setSocialDialogOpen] = useState<boolean>(false)
  const [socialType, setSocialType] = useState<string>('GITHUB')
  const [socialLabel, setSocialLabel] = useState<string>('')
  const [socialUrl, setSocialUrl] = useState<string>('')

  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false)
  const [newEmail, setNewEmail] = useState<string>('')
  const [emailPassword, setEmailPassword] = useState<string>('')

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Card className={styles.profileHeader}>
          <SkeletonLine width="20%" />
          <SkeletonLine width="40%" />
          <SkeletonLine width="30%" />
        </Card>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }
  if (isError) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: 48 }}>
        <Title3 as="h3">Failed to load profile</Title3>
        <p style={{ marginBottom: 12 }}>Something went wrong. Please try again.</p>
        <Button appearance="primary" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const handleEditOpen = () => {
    setEditName(profile?.name || '')
    setEditBio(profile?.bio || '')
    setEditDialogOpen(true)
  }

  const handleEditSave = () => {
    updateProfile.mutate({ name: editName, bio: editBio }, {
      onSuccess: () => setEditDialogOpen(false),
    })
  }

  const handleSubjectsOpen = () => {
    setSelectedSubjects(profile?.subjects?.map((s: string | { name: string }) => typeof s === 'string' ? s : s.name) || [])
    setSubjectsDialogOpen(true)
  }

  const handleSubjectsSave = () => {
    updateSubjects.mutate(selectedSubjects, {
      onSuccess: () => setSubjectsDialogOpen(false),
    })
  }

  const handleAddSocial = () => {
    addSocial.mutate(
      { platform: socialType, url: socialUrl },
      {
        onSuccess: () => {
          setSocialDialogOpen(false)
          setSocialLabel('')
          setSocialUrl('')
        },
      }
    )
  }

  const handleRemoveSocial = (socialId: number) => {
    removeSocial.mutate(socialId)
  }

  const handleChangeEmail = () => {
    changeEmail.mutate(
      { newEmail, password: emailPassword },
      {
        onSuccess: () => {
          setEmailDialogOpen(false)
          setNewEmail('')
          setEmailPassword('')
        },
      }
    )
  }

  return (
    <div className={styles.container}>
      <Seo
        title={`${profile?.name || 'Profile'} — LernChih`}
        description={`${profile?.name || 'User'}'s profile on LernChih.`}
        canonicalPath={isOwnProfile ? '/profile' : `/profile/${id}`}
        robots="noindex, follow"
      />
      {/* Profile header */}
      <Card className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <Avatar name={profile?.name || 'User'} size={72} />
          <Badge appearance="filled" color="brand" className={styles.creditsBadge}>
            {profile?.credits ?? 0}
          </Badge>
        </div>
        <div className={styles.profileInfo}>
          <Title2 as="h1">{profile?.name || 'User'}</Title2>
          <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>{profile?.email}</Body1>
          <Badge appearance="tint">{profile?.role || 'STUDENT'}</Badge>
          {profile?.bio && <Body1 style={{ marginTop: '4px' }}>{profile.bio}</Body1>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS, alignItems: 'flex-end' }}>
          {isOwnProfile ? (
            <Button appearance="outline" icon={<Edit24Regular />} onClick={handleEditOpen}>
              Edit
            </Button>
          ) : (
            profile && <FollowButton userId={profile.id ?? Number(id)} />
          )}
          {profile?.id && <EndorsementBadge userId={profile.id} />}
        </div>
      </Card>

      {/* Subjects */}
      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Subtitle1 as="h2">Subjects</Subtitle1>
          {isOwnProfile && (
            <Button appearance="subtle" icon={<Edit24Regular />} onClick={handleSubjectsOpen}>Edit</Button>
          )}
        </div>
        <div className={styles.tagsRow}>
          {(profile?.subjects?.length ?? 0) > 0 ? (
            profile!.subjects.map((s: string | { name: string }, i: number) => (
              <Badge key={i} appearance="tint">{typeof s === 'string' ? s : s.name}</Badge>
            ))
          ) : (
            <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No subjects added</Body1>
          )}
        </div>
      </Card>

      {/* Social links */}
      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Subtitle1 as="h2">Social Links</Subtitle1>
          {isOwnProfile && (
            <Button appearance="subtle" icon={<Add24Regular />} onClick={() => setSocialDialogOpen(true)}>Add</Button>
          )}
        </div>
        <div className={styles.socialRow}>
          {(profile?.socials?.length ?? 0) > 0 ? (
            profile!.socials.map((social) => (
              <div key={social.id} className={styles.socialItem}>
                <Badge appearance="outline">{social.platform}</Badge>
                <a href={social.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fontSizeBase300)' }}>
                  {social.url}
                </a>
                {isOwnProfile && (
                  <Button
                    appearance="subtle"
                    icon={<Dismiss24Regular />}
                    size="small"
                    onClick={() => handleRemoveSocial(social.id)}
                  />
                )}
              </div>
            ))
          ) : (
            <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No social links added</Body1>
          )}
        </div>
      </Card>

      {/* Notification preferences */}
      {isOwnProfile && (
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Subtitle1 as="h2">Notification Preferences</Subtitle1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onChange={(_, data) =>
                  setPreferences({ ...preferences, emailNotifications: data.checked as boolean })
                }
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onChange={(_, data) =>
                  setPreferences({ ...preferences, pushNotifications: data.checked as boolean })
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Account security */}
      {isOwnProfile && (
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Subtitle1 as="h2">Account Security</Subtitle1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalS }}>
                <div>
                  <Text weight="semibold">Email address</Text>
                  <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>{profile?.email}</Body1>
                </div>
                <Button appearance="outline" onClick={() => setEmailDialogOpen(true)}>
                  Change email
                </Button>
              </div>
            </div>
            <TwoFactorSetup />
          </div>
        </Card>
      )}

      {/* Data & privacy */}
      {isOwnProfile && (
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Subtitle1 as="h2">Data &amp; Privacy</Subtitle1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text weight="semibold">Export my data</Text>
                <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>Download a copy of your personal data.</Body1>
              </div>
              <Button
                appearance="outline"
                onClick={() => exportData.mutate()}
                disabled={exportData.isPending}
              >
                {exportData.isPending ? <Spinner size="tiny" /> : 'Export'}
              </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text weight="semibold">Delete my account</Text>
                <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>Permanently remove your account and data.</Body1>
              </div>
              <ConfirmDialog
                trigger={<Button appearance="primary" color="danger">Delete account</Button>}
                title="Delete your account?"
                content="This will permanently delete your account and all associated data. This action cannot be undone."
                confirmLabel="Delete"
                destructive
                onConfirm={() => deleteAccount.mutate()}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Badges */}
      <Card className={styles.sectionCard}>
        <BadgesWidget userId={profile?.id ?? Number(id)} />
      </Card>

      {/* Edit profile dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setEditDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                <Field label="Name">
                  <Input value={editName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)} aria-required="true" />
                </Field>
                <Field label="Bio">
                  <Textarea value={editBio} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBio(e.target.value)} />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleEditSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Spinner size="tiny" /> : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Edit subjects dialog */}
      <Dialog open={subjectsDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setSubjectsDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Subjects</DialogTitle>
            <DialogContent>
              <div className={styles.tagsRow}>
                {SUBJECTS.map((s) => {
                  const isSelected = selectedSubjects.includes(s)
                  return (
                    <Badge
                      key={s}
                      appearance={isSelected ? 'filled' : 'outline'}
                      color={isSelected ? 'brand' : 'informative'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedSubjects((prev) =>
                          isSelected ? prev.filter((x) => x !== s) : [...prev, s]
                        )
                      }}
                    >
                      {s}
                    </Badge>
                  )
                })}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setSubjectsDialogOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleSubjectsSave} disabled={updateSubjects.isPending}>
                {updateSubjects.isPending ? <Spinner size="tiny" /> : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add social dialog */}
      <Dialog open={socialDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setSocialDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Social Link</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                <Field label="Type">
                  <Select value={socialType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSocialType(e.target.value)}>
                    {SOCIAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Label">
                  <Input value={socialLabel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocialLabel(e.target.value)} placeholder="e.g. My GitHub" />
                </Field>
                <Field label="URL">
                  <Input value={socialUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSocialUrl(e.target.value)} placeholder="https://..." aria-required="true" />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setSocialDialogOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddSocial} disabled={addSocial.isPending || !socialUrl.trim()}>
                {addSocial.isPending ? <Spinner size="tiny" /> : 'Add'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Change email dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setEmailDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Change Email</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                <Field label="New email">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                    placeholder="new@university.edu"
                    aria-required="true"
                  />
                </Field>
                <Field label="Current password">
                  <Input
                    type="password"
                    value={emailPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailPassword(e.target.value)}
                    placeholder="Enter your current password"
                    aria-required="true"
                  />
                </Field>
              </div>
              {changeEmail.isError && (
                <MessageBar intent="error" style={{ marginTop: tokens.spacingVerticalM }}>
                  <MessageBarBody>Failed to change email. Please check your password and try again.</MessageBarBody>
                </MessageBar>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button
                appearance="primary"
                onClick={handleChangeEmail}
                disabled={changeEmail.isPending || !newEmail.trim() || !emailPassword.trim()}
              >
                {changeEmail.isPending ? <Spinner size="tiny" /> : 'Change email'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}
