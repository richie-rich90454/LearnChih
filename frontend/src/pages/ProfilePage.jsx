import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Title2,
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
} from '@fluentui/react-components';
import { Edit24Regular, Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { useMyProfile, useUserProfile, useUpdateProfile, useUpdateSubjects, useAddSocial, useRemoveSocial } from '../hooks/useProfile';

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
});

const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Economics', 'English', 'History', 'Other'];
const SOCIAL_TYPES = ['GITHUB', 'LINKEDIN', 'TWITTER', 'WEBSITE', 'OTHER'];

export default function ProfilePage() {
  const styles = useStyles();
  const { id } = useParams();
  const isOwnProfile = !id;

  const profileQuery = isOwnProfile ? useMyProfile() : useUserProfile(id);
  const { data: profile, isLoading, isError } = profileQuery;

  const updateProfile = useUpdateProfile();
  const updateSubjects = useUpdateSubjects();
  const addSocial = useAddSocial();
  const removeSocial = useRemoveSocial();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const [subjectsDialogOpen, setSubjectsDialogOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [socialType, setSocialType] = useState('GITHUB');
  const [socialLabel, setSocialLabel] = useState('');
  const [socialUrl, setSocialUrl] = useState('');

  if (isLoading) return <Spinner label="Loading profile..." />;
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load profile.</MessageBarBody>
      </MessageBar>
    );
  }

  const handleEditOpen = () => {
    setEditName(profile?.name || '');
    setEditBio(profile?.bio || '');
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    updateProfile.mutate({ name: editName, bio: editBio }, {
      onSuccess: () => setEditDialogOpen(false),
    });
  };

  const handleSubjectsOpen = () => {
    setSelectedSubjects(profile?.subjects?.map((s) => s.name || s) || []);
    setSubjectsDialogOpen(true);
  };

  const handleSubjectsSave = () => {
    updateSubjects.mutate(selectedSubjects, {
      onSuccess: () => setSubjectsDialogOpen(false),
    });
  };

  const handleAddSocial = () => {
    addSocial.mutate(
      { type: socialType, label: socialLabel, url: socialUrl },
      {
        onSuccess: () => {
          setSocialDialogOpen(false);
          setSocialLabel('');
          setSocialUrl('');
        },
      }
    );
  };

  const handleRemoveSocial = (socialId) => {
    removeSocial.mutate(socialId);
  };

  return (
    <div className={styles.container}>
      {/* Profile header */}
      <Card className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <Avatar name={profile?.name || 'User'} size={72} />
          <Badge appearance="filled" color="brand" className={styles.creditsBadge}>
            {profile?.credits ?? 0}
          </Badge>
        </div>
        <div className={styles.profileInfo}>
          <Title2>{profile?.name || 'User'}</Title2>
          <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>{profile?.email}</Body1>
          <Badge appearance="tint">{profile?.role || 'STUDENT'}</Badge>
          {profile?.bio && <Body1 style={{ marginTop: '4px' }}>{profile.bio}</Body1>}
        </div>
        {isOwnProfile && (
          <Button appearance="outline" icon={<Edit24Regular />} onClick={handleEditOpen} style={{ marginLeft: 'auto' }}>
            Edit
          </Button>
        )}
      </Card>

      {/* Subjects */}
      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Subtitle1>Subjects</Subtitle1>
          {isOwnProfile && (
            <Button appearance="subtle" icon={<Edit24Regular />} onClick={handleSubjectsOpen}>Edit</Button>
          )}
        </div>
        <div className={styles.tagsRow}>
          {profile?.subjects?.length > 0 ? (
            profile.subjects.map((s, i) => (
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
          <Subtitle1>Social Links</Subtitle1>
          {isOwnProfile && (
            <Button appearance="subtle" icon={<Add24Regular />} onClick={() => setSocialDialogOpen(true)}>Add</Button>
          )}
        </div>
        <div className={styles.socialRow}>
          {profile?.socials?.length > 0 ? (
            profile.socials.map((social) => (
              <div key={social.id} className={styles.socialItem}>
                <Badge appearance="outline">{social.type}</Badge>
                <a href={social.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fontSizeBase300)' }}>
                  {social.label || social.url}
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

      {/* Edit profile dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(_, d) => setEditDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                <Field label="Name">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </Field>
                <Field label="Bio">
                  <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} />
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
      <Dialog open={subjectsDialogOpen} onOpenChange={(_, d) => setSubjectsDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Subjects</DialogTitle>
            <DialogContent>
              <div className={styles.tagsRow}>
                {SUBJECTS.map((s) => {
                  const isSelected = selectedSubjects.includes(s);
                  return (
                    <Badge
                      key={s}
                      appearance={isSelected ? 'filled' : 'outline'}
                      color={isSelected ? 'brand' : 'informative'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedSubjects((prev) =>
                          isSelected ? prev.filter((x) => x !== s) : [...prev, s]
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
              <Button appearance="secondary" onClick={() => setSubjectsDialogOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleSubjectsSave} disabled={updateSubjects.isPending}>
                {updateSubjects.isPending ? <Spinner size="tiny" /> : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add social dialog */}
      <Dialog open={socialDialogOpen} onOpenChange={(_, d) => setSocialDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Social Link</DialogTitle>
            <DialogContent>
              <div className={styles.dialogForm}>
                <Field label="Type">
                  <Select value={socialType} onChange={(e) => setSocialType(e.target.value)}>
                    {SOCIAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Label">
                  <Input value={socialLabel} onChange={(e) => setSocialLabel(e.target.value)} placeholder="e.g. My GitHub" />
                </Field>
                <Field label="URL">
                  <Input value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} placeholder="https://..." />
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
    </div>
  );
}
