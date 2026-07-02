import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
} from '@fluentui/react-components'
import {
  ArrowUp24Regular,
  ArrowUp24Filled,
  Flag24Regular,
  ArrowLeft24Regular,
  Bookmark24Regular,
  Bookmark24Filled,
} from '@fluentui/react-icons'
import { useResource, useDeleteResource } from '../hooks/useResources'
import { useResourcePosts, useCreateResourcePost } from '../hooks/useThreads'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportResource, toggleUpvote as toggleUpvoteApi } from '../api/resources'
import useAuthStore from '../store/authStore'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { useBookmarkStore } from '../store/bookmarkStore'
import useWebSocket from '../hooks/useWebSocket'
import type { Post, ResourceDetail } from '../types'
import Seo from '../components/Seo'
import { ConfirmDialog } from '../components/ConfirmDialog'
import ReportButton from '../components/ReportButton'
import { RelatedResources } from '../components/RelatedResources'
import { TagList } from '../components/TagBadge'
import { articleSchema, breadcrumbSchema } from '../components/jsonLd'

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
    flexWrap: 'wrap',
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
  postActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
    alignItems: 'center',
  },
})

function getBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function ResourceDetailPage() {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: resource, isLoading, isError } = useResource(id)
  const { data: posts, isLoading: postsLoading } = useResourcePosts(id)
  const queryClient = useQueryClient()
  const deleteResource = useDeleteResource()
  const user = useAuthStore((s) => s.user)
  const { toggleBookmark, isBookmarked } = useBookmarkStore()

  // Optimistic upvote: update the cache instantly and roll back on error.
  const upvoteMutation = useMutation({
    mutationFn: () => toggleUpvoteApi(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['resource', id] })
      const previousData = queryClient.getQueryData<ResourceDetail>(['resource', id])
      queryClient.setQueryData<ResourceDetail>(['resource', id], (old) => {
        if (!old) return old
        return {
          ...old,
          upvoteCount: old.upvoteCount + (old.upvoted ? -1 : 1),
          upvoted: !old.upvoted,
        }
      })
      return { previousData }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['resource', id], context?.previousData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
  const createPost = useCreateResourcePost(id)
  const { subscribeToThread } = useWebSocket()

  const [newPost, setNewPost] = useState<string>('')
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false)
  const [reportReason, setReportReason] = useState<string>('')

  // Subscribe to real-time updates for this thread
  useEffect(() => {
    if (!id) return
    const unsubscribe = subscribeToThread(id, () => {
      // Post will be added to cache by the hook
    })
    return unsubscribe
  }, [id, subscribeToThread])

  const handleUpvote = () => {
    upvoteMutation.mutate()
  }

  const handlePost = () => {
    if (!newPost.trim()) return
    createPost.mutate(newPost, {
      onSuccess: () => setNewPost(''),
    })
  }

  const handleReport = () => {
    reportResource(id, reportReason).then(() => {
      setReportDialogOpen(false)
      setReportReason('')
    })
  }

  const handleDelete = () => {
    if (!resource) return
    deleteResource.mutate(resource.id, {
      onSuccess: () => {
        navigate('/resources')
      },
    })
  }

  const isOwner = !!user && !!resource && user.userId === resource.userId

  if (isLoading) return <Spinner label="Loading resource..." />
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load resource. It may not exist or you don&apos;t have access.</MessageBarBody>
      </MessageBar>
    )
  }

  const postList: Post[] = Array.isArray(posts) ? posts : (posts as any)?.content || []

  const resourceTitle = resource?.title || 'Resource'
  const resourceSlug = resource?.slug || id
  const canonicalPath = `/resources/${resourceSlug}`
  const baseUrl = getBaseUrl()
  const articleUrl = `${baseUrl}${canonicalPath}`
  const seoDescription = resource?.description || `${resourceTitle} on LernChih`
  const jsonLd = [
    articleSchema({
      title: resourceTitle,
      description: seoDescription,
      url: articleUrl,
      datePublished: resource?.createdAt,
      author: resource?.authorName,
    }),
    breadcrumbSchema([
      { name: 'Resources', url: `${baseUrl}/resources` },
      { name: resourceTitle, url: articleUrl },
    ]),
  ]

  return (
    <div className={styles.container}>
      <Seo
        title={`${resourceTitle} — LernChih`}
        description={seoDescription}
        canonicalPath={canonicalPath}
        ogType="article"
        jsonLd={jsonLd}
        hreflang
      />
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
            <Title2 as="h1">{resource?.title}</Title2>
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

        {resource?.tags && resource.tags.length > 0 && (
          <div className={styles.infoMeta}>
            <TagList tags={resource.tags} />
          </div>
        )}

        <div className={styles.actionRow}>
          <Button
            appearance={resource?.upvoted ? 'primary' : 'outline'}
            icon={resource?.upvoted ? <ArrowUp24Filled /> : <ArrowUp24Regular />}
            onClick={handleUpvote}
          >
            <AnimatedCounter value={resource?.upvoteCount ?? 0} />
          </Button>

          <Button
            appearance={isBookmarked(resource?.id ?? 0) ? 'primary' : 'outline'}
            icon={isBookmarked(resource?.id ?? 0) ? <Bookmark24Filled /> : <Bookmark24Regular />}
            onClick={() => resource && toggleBookmark(resource.id, resource.title)}
            aria-pressed={isBookmarked(resource?.id ?? 0)}
          >
            {isBookmarked(resource?.id ?? 0) ? 'Saved' : 'Save'}
          </Button>

          {resource?.url && (
            <Button appearance="outline" onClick={() => window.open(resource.url, '_blank')}>
              Open Link
            </Button>
          )}

          <Dialog open={reportDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setReportDialogOpen(d.open)}>
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
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportReason(e.target.value)}
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

          {isOwner && (
            <ConfirmDialog
              trigger={<Button appearance="subtle">Delete</Button>}
              title="Delete resource?"
              content="This action cannot be undone."
              confirmLabel="Delete"
              destructive
              onConfirm={handleDelete}
            />
          )}
        </div>
      </Card>

      {/* Thread / Discussion */}
      <div className={styles.threadSection}>
        <Subtitle1 as="h2">Discussion</Subtitle1>

        {/* New post */}
        <div className={styles.newPostRow}>
          <Textarea
            value={newPost}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost(e.target.value)}
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
            <div className={styles.postActions}>
              <ReportButton targetType="RESOURCE_POST" targetId={post.id} />
            </div>
          </Card>
        ))}
      </div>

      {id && <RelatedResources resourceId={id} />}
    </div>
  )
}
