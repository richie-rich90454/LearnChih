import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
import { useResource, useDeleteResource } from '@/hooks/useResources'
import { useResourcePosts, useCreateResourcePost } from '@/hooks/useThreads'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportResource, toggleUpvote as toggleUpvoteApi } from '@/api/resources'
import useAuthStore from '@/store/authStore'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useBookmarkStore } from '@/store/bookmarkStore'
import useWebSocket from '@/hooks/useWebSocket'
import { useTranslation } from 'react-i18next'
import type { Post, ResourceDetail } from '@/types'
import Seo from '@/components/Seo'
import { useBackgroundSync } from '@/hooks/useBackgroundSync'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import ReportButton from '@/components/ReportButton'
import { RelatedResources } from '@/components/RelatedResources'
import { TagList } from '@/components/TagBadge'
import { articleSchema, breadcrumbSchema } from '@/components/jsonLd'

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
  const { t } = useTranslation()
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: resource, isLoading, isError } = useResource(id)
  const { data: posts, isLoading: postsLoading } = useResourcePosts(id)
  const queryClient = useQueryClient()
  const deleteResource = useDeleteResource()
  const { user, isAuthenticated } = useAuthStore()
  const authenticated = isAuthenticated()
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
  const { queueWrite, isOnline } = useBackgroundSync()

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

  const applyOptimisticUpvote = async () => {
    await queryClient.cancelQueries({ queryKey: ['resource', id] })
    queryClient.setQueryData<ResourceDetail>(['resource', id], (old) => {
      if (!old) return old
      return {
        ...old,
        upvoteCount: old.upvoteCount + (old.upvoted ? -1 : 1),
        upvoted: !old.upvoted,
      }
    })
  }

  const handleUpvote = () => {
    if (isOnline) {
      upvoteMutation.mutate()
      return
    }
    // Offline: apply optimistic update and queue for replay.
    applyOptimisticUpvote()
    queueWrite(`${window.location.origin}/api/resources/${id}/upvote`, 'POST', undefined, () => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })
  }

  const handlePost = () => {
    if (!newPost.trim()) return
    if (isOnline) {
      createPost.mutate(newPost, {
        onSuccess: () => setNewPost(''),
      })
      return
    }
    // Offline: queue the write and clear the input. The list will refresh on reconnect.
    queueWrite(
      `${window.location.origin}/api/resources/${id}/posts`,
      'POST',
      { content: newPost },
      () => {
        queryClient.invalidateQueries({ queryKey: ['resourcePosts', id] })
        queryClient.invalidateQueries({ queryKey: ['resources'] })
      },
    )
    setNewPost('')
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

  if (isLoading) return <Spinner label={t('common.loading')} />
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>{t('errors.loadResource')}</MessageBarBody>
      </MessageBar>
    )
  }

  const postList: Post[] = Array.isArray(posts) ? posts : (posts as any)?.content || []

  const resourceTitle = resource?.title || t('resources.title')
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
          {t('resources.backToResources') || t('resources.title')}
        </Button>
      </div>

      {/* Resource info */}
      <Card className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <div>
            <Title2 as="h1">{resource?.title}</Title2>
            <div className={styles.infoMeta}>
              <Badge appearance="tint">{resource?.category?.replace('_', ' ') || t('resources.general')}</Badge>
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
            {t('common.byAuthor', { author: resource?.authorName || t('common.unknown') })}
          </span>
          {resource?.createdAt && (
            <time
              dateTime={new Date(resource.createdAt).toISOString()}
              style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}
            >
              {t('common.onDate', { date: new Date(resource.createdAt).toLocaleDateString() })}
            </time>
          )}
        </div>

        {resource?.tags && resource.tags.length > 0 && (
          <div className={styles.infoMeta}>
            <TagList tags={resource.tags} />
          </div>
        )}

        <div className={styles.actionRow}>
          {authenticated ? (
            <>
              <Button
                appearance={resource?.upvoted ? 'primary' : 'outline'}
                icon={resource?.upvoted ? <ArrowUp24Filled /> : <ArrowUp24Regular />}
                onClick={handleUpvote}
                aria-label={t('resources.upvotes')}
              >
                <AnimatedCounter value={resource?.upvoteCount ?? 0} />
              </Button>

              <Button
                appearance={isBookmarked(resource?.id ?? 0) ? 'primary' : 'outline'}
                icon={isBookmarked(resource?.id ?? 0) ? <Bookmark24Filled /> : <Bookmark24Regular />}
                onClick={() => resource && toggleBookmark(resource.id, resource.title)}
                aria-pressed={isBookmarked(resource?.id ?? 0)}
              >
                {isBookmarked(resource?.id ?? 0) ? t('common.saved') : t('resources.save')}
              </Button>

              <Dialog open={reportDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setReportDialogOpen(d.open)}>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="subtle" icon={<Flag24Regular />}>{t('common.report')}</Button>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogTitle>{t('resources.reportResource')}</DialogTitle>
                    <DialogContent>
                      <Field label={t('admin.reason')}>
                        <Textarea
                          value={reportReason}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportReason(e.target.value)}
                          placeholder={t('resources.reportReason')}
                        />
                      </Field>
                    </DialogContent>
                    <DialogActions>
                      <Button appearance="secondary" onClick={() => setReportDialogOpen(false)}>{t('common.cancel')}</Button>
                      <Button appearance="primary" onClick={handleReport} disabled={!reportReason.trim()}>
                        {t('common.submit')}
                      </Button>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>

              {isOwner && (
                <ConfirmDialog
                  trigger={<Button appearance="subtle">{t('common.delete')}</Button>}
                  title={t('resources.deleteConfirmTitle')}
                  content={t('resources.deleteConfirmContent')}
                  confirmLabel={t('common.delete')}
                  destructive
                  onConfirm={handleDelete}
                />
              )}
            </>
          ) : (
            <Link to={`/login?redirect=/resources/${id}`} style={{ color: tokens.colorBrandForeground1 }}>
              {t('auth.loginToInteract')}
            </Link>
          )}

          {resource?.url && (
            <Button appearance="outline" onClick={() => window.open(resource.url, '_blank')}>
              {t('resources.openLink')}
            </Button>
          )}
        </div>
      </Card>

      {/* Thread / Discussion */}
      <section className={styles.threadSection} aria-label={t('resources.discussion')}>
        <Subtitle1 as="h2">{t('resources.discussion')}</Subtitle1>

        {/* New post */}
        {authenticated ? (
          <div className={styles.newPostRow}>
            <Textarea
              value={newPost}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost(e.target.value)}
              placeholder={t('resources.writeComment')}
              style={{ flex: 1 }}
            />
            <Button
              appearance="primary"
              onClick={handlePost}
              disabled={createPost.isPending || !newPost.trim()}
            >
              {createPost.isPending ? <Spinner size="tiny" /> : t('resources.post')}
            </Button>
          </div>
        ) : (
          <Link to={`/login?redirect=/resources/${id}`} style={{ color: tokens.colorBrandForeground1 }}>
            {t('auth.loginToInteract')}
          </Link>
        )}

        {/* Posts list */}
        {postsLoading && <Spinner size="small" />}
        {postList.length === 0 && !postsLoading && (
          <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>{t('resources.noComments')}</Body1>
        )}
        {postList.map((post) => (
          <article key={post.id}>
            <Card className={styles.postCard}>
              <div className={styles.postHeader}>
                <Avatar name={post.authorName || t('common.user')} size={28} />
                <Subtitle2>{post.authorName || t('common.unknown')}</Subtitle2>
                {post.createdAt && (
                  <time
                    dateTime={new Date(post.createdAt).toISOString()}
                    style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}
                  >
                    {new Date(post.createdAt).toLocaleString()}
                  </time>
                )}
              </div>
              <Body1>{post.content}</Body1>
              <div className={styles.postActions}>
                {authenticated && <ReportButton targetType="RESOURCE_POST" targetId={post.id} />}
              </div>
            </Card>
          </article>
        ))}
      </section>

      {id && <RelatedResources resourceId={id} />}
    </div>
  )
}
