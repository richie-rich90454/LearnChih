import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Textarea,
  Avatar,
  Divider,
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
} from '@fluentui/react-components';
import {
  ArrowUp24Regular,
  ArrowUp24Filled,
  Flag24Regular,
  ArrowLeft24Regular,
} from '@fluentui/react-icons';
import { useResource, useToggleUpvote } from '../hooks/useResources';
import { useResourcePosts, useCreateResourcePost } from '../hooks/useThreads';
import { reportResource } from '../api/resources';
import useWebSocket from '../hooks/useWebSocket';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '800px',
  },
  backRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  infoCard: {
    padding: tokens.spacingHorizontalXL,
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  infoMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    marginTop: tokens.spacingVerticalXS,
    flexWrap: 'wrap',
  },
  actionRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    marginTop: tokens.spacingVerticalS,
  },
  threadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  postCard: {
    padding: tokens.spacingHorizontalL,
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalS,
  },
  newPostRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'flex-end',
  },
});

export default function ResourceDetailPage() {
  const styles = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: resource, isLoading, isError } = useResource(id);
  const { data: posts, isLoading: postsLoading } = useResourcePosts(id);
  const toggleUpvote = useToggleUpvote();
  const createPost = useCreateResourcePost(id);
  const { subscribeToThread } = useWebSocket();

  const [newPost, setNewPost] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Subscribe to real-time updates for this thread
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToThread(id, () => {
      // Post will be added to cache by the hook
    });
    return unsubscribe;
  }, [id, subscribeToThread]);

  const handleUpvote = () => {
    toggleUpvote.mutate(id);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    createPost.mutate(newPost, {
      onSuccess: () => setNewPost(''),
    });
  };

  const handleReport = () => {
    reportResource(id, reportReason).then(() => {
      setReportDialogOpen(false);
      setReportReason('');
    });
  };

  if (isLoading) return <Spinner label="Loading resource..." />;
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load resource. It may not exist or you don&apos;t have access.</MessageBarBody>
      </MessageBar>
    );
  }

  const postList = Array.isArray(posts) ? posts : posts?.content || [];

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div className={styles.backRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/resources')}>
          Back to Resources
        </Button>
      </div>

      {/* Resource info */}
      <Card className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <div>
            <Title2>{resource?.title}</Title2>
            <div className={styles.infoMeta}>
              <Badge appearance="tint">{resource?.category?.replace('_', ' ') || 'General'}</Badge>
              {resource?.subject && <Badge appearance="outline">{resource.subject}</Badge>}
              {resource?.type && <Badge appearance="outline">{resource.type}</Badge>}
            </div>
          </div>
        </div>

        {resource?.description && (
          <Body1 style={{ marginTop: '12px', display: 'block' }}>{resource.description}</Body1>
        )}

        <div className={styles.infoMeta}>
          <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
            Uploaded by {resource?.authorName || 'Unknown'}
          </span>
          {resource?.createdAt && (
            <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
              on {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className={styles.actionRow}>
          <Button
            appearance={resource?.upvoted ? 'primary' : 'outline'}
            icon={resource?.upvoted ? <ArrowUp24Filled /> : <ArrowUp24Regular />}
            onClick={handleUpvote}
          >
            {resource?.upvoteCount ?? 0}
          </Button>

          {resource?.url && (
            <Button appearance="outline" onClick={() => window.open(resource.url, '_blank')}>
              Open Link
            </Button>
          )}

          <Dialog open={reportDialogOpen} onOpenChange={(_, d) => setReportDialogOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="subtle" icon={<Flag24Regular />}>Report</Button>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Report Resource</DialogTitle>
                <DialogContent>
                  <Field label="Reason">
                    <Textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Why are you reporting this resource?"
                    />
                  </Field>
                </DialogContent>
                <DialogActions>
                  <Button appearance="secondary" onClick={() => setReportDialogOpen(false)}>Cancel</Button>
                  <Button appearance="primary" onClick={handleReport} disabled={!reportReason.trim()}>
                    Submit Report
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </div>
      </Card>

      {/* Thread / Discussion */}
      <div className={styles.threadSection}>
        <Subtitle1>Discussion</Subtitle1>

        {/* New post */}
        <div className={styles.newPostRow}>
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write a comment..."
            style={{ flex: 1 }}
          />
          <Button
            appearance="primary"
            onClick={handlePost}
            disabled={createPost.isPending || !newPost.trim()}
          >
            {createPost.isPending ? <Spinner size="tiny" /> : 'Post'}
          </Button>
        </div>

        {/* Posts list */}
        {postsLoading && <Spinner size="small" />}
        {postList.length === 0 && !postsLoading && (
          <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No comments yet. Start the discussion!</Body1>
        )}
        {postList.map((post) => (
          <Card key={post.id} className={styles.postCard}>
            <div className={styles.postHeader}>
              <Avatar name={post.authorName || 'User'} size={28} />
              <Subtitle2>{post.authorName || 'Unknown'}</Subtitle2>
              <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
              </span>
            </div>
            <Body1>{post.content}</Body1>
          </Card>
        ))}
      </div>
    </div>
  );
}
