import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle2,
  Card,
  Badge,
  Button,
  Dropdown,
  Option,
  Input,
  Label,
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
  MessageBarTitle,
  Select,
  Field,
} from '@fluentui/react-components';
import { Add24Regular, ArrowUpload24Regular, Link24Regular } from '@fluentui/react-icons';
import { useResources, useCreateResource } from '../hooks/useResources';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '1100px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  filterBar: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  resourceCard: {
    cursor: 'pointer',
    padding: tokens.spacingHorizontalL,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalXS,
  },
  cardMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    marginTop: tokens.spacingVerticalXS,
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
});

const CATEGORIES = ['NOTES', 'PAST_PAPER', 'TEXTBOOK', 'TUTORIAL', 'OTHER'];
const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Economics', 'English', 'History', 'Other'];

export default function ResourcesPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('NOTES');
  const [resourceType, setResourceType] = useState('UPLOAD');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState('');

  const params = {};
  if (categoryFilter) params.category = categoryFilter;
  if (subjectFilter) params.subject = subjectFilter;

  const { data, isLoading, isError } = useResources(params);
  const createMutation = useCreateResource();

  const resources = Array.isArray(data) ? data : data?.content || [];

  const handleCreate = () => {
    const formData = {
      title,
      description,
      category,
      type: resourceType,
      subject,
      topic,
      course,
    };
    if (resourceType === 'UPLOAD' && file) {
      formData.file = file;
    } else if (resourceType === 'LINK') {
      formData.url = url;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setDialogOpen(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('NOTES');
    setResourceType('UPLOAD');
    setFile(null);
    setUrl('');
    setSubject('');
    setTopic('');
    setCourse('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Title2>Resources</Title2>
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>Upload Resource</Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Upload Resource</DialogTitle>
              <DialogContent>
                {createMutation.isError && (
                  <MessageBar intent="error">
                    <MessageBarBody>
                      {createMutation.error?.response?.data?.message || 'Failed to create resource'}
                    </MessageBarBody>
                  </MessageBar>
                )}
                <div className={styles.dialogForm}>
                  <Field label="Title" required>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" />
                  </Field>
                  <Field label="Description">
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
                  </Field>
                  <Field label="Category">
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Type">
                    <Select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                      <option value="UPLOAD">File Upload</option>
                      <option value="LINK">External Link</option>
                    </Select>
                  </Field>
                  {resourceType === 'UPLOAD' ? (
                    <Field label="File">
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </Field>
                  ) : (
                    <Field label="URL">
                      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                    </Field>
                  )}
                  <Field label="Subject">
                    <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option value="">Select subject</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Topic">
                    <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Calculus" />
                  </Field>
                  <Field label="Course">
                    <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. MATH101" />
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button
                  appearance="primary"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !title}
                >
                  {createMutation.isPending ? <Spinner size="tiny" /> : 'Upload'}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <Dropdown
          placeholder="Category"
          value={categoryFilter || undefined}
          selectedOptions={categoryFilter ? [categoryFilter] : []}
          onOptionSelect={(_, data) => setCategoryFilter(data.optionValue || '')}
          clearable
        >
          {CATEGORIES.map((c) => (
            <Option key={c} value={c}>{c.replace('_', ' ')}</Option>
          ))}
        </Dropdown>
        <Dropdown
          placeholder="Subject"
          value={subjectFilter || undefined}
          selectedOptions={subjectFilter ? [subjectFilter] : []}
          onOptionSelect={(_, data) => setSubjectFilter(data.optionValue || '')}
          clearable
        >
          {SUBJECTS.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Dropdown>
      </div>

      {/* Resources grid */}
      {isLoading && <Spinner label="Loading resources..." />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load resources. Please try again.</MessageBarBody>
        </MessageBar>
      )}
      {!isLoading && resources.length === 0 && (
        <MessageBar>
          <MessageBarBody>No resources found. Upload the first one!</MessageBarBody>
        </MessageBar>
      )}
      <div className={styles.grid}>
        {resources.map((resource) => (
          <Card
            key={resource.id}
            className={styles.resourceCard}
            onClick={() => navigate(`/resources/${resource.id}`)}
          >
            <div className={styles.cardHeader}>
              <Subtitle2>{resource.title}</Subtitle2>
              <Badge appearance="tint" size="small">
                {resource.category?.replace('_', ' ') || 'General'}
              </Badge>
            </div>
            <div className={styles.cardMeta}>
              <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
                by {resource.authorName || 'Unknown'}
              </span>
              <Badge appearance="outline" size="small">
                {resource.upvoteCount ?? 0} upvotes
              </Badge>
            </div>
            {resource.subject && (
              <Badge appearance="outline" size="small" style={{ marginTop: '4px' }}>
                {resource.subject}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
