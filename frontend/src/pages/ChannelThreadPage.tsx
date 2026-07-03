import { useState, useEffect, useRef, useCallback } from 'react'
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
  Spinner,
  MessageBar,
  MessageBarBody,
  Dropdown,
  Option,
} from '@fluentui/react-components'
import { ArrowLeft24Regular, Mention24Regular } from '@fluentui/react-icons'
import { useChannel, useChannelPosts, useCreateChannelPost } from '@/hooks/useChannels'
import useWebSocket from '@/hooks/useWebSocket'
import useAuthStore from '@/store/authStore'
import type { Post, PostFormat } from '@/types'
import Seo from '@/components/Seo'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { ThreadBadges } from '@/components/ThreadBadges'
import { ReactionPicker } from '@/components/ReactionPicker'
import ReportButton from '@/components/ReportButton'
import { discussionForumPostingSchema, breadcrumbSchema } from '@/components/jsonLd'

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
  threadInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
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
    flexWrap: 'wrap',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  replyForm: {
    marginLeft: tokens.spacingHorizontalXXL,
    marginTop: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  postActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
    alignItems: 'center',
  },
  typingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
    minHeight: '24px',
  },
  readReceipt: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
  },
})

function getBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function ChannelThreadPage() {
  const styles = useStyles()
  const { channelId, threadId } = useParams<{ channelId: string; threadId: string }>()
  const navigate = useNavigate()
  const { data: channel } = useChannel(channelId ? Number(channelId) : undefined)
  const { data: posts, isLoading, isError } = useChannelPosts(channelId ? Number(channelId) : undefined, threadId)
  const createPost = useCreateChannelPost(channelId ? Number(channelId) : undefined, threadId)
  const { subscribeToChannelThread, subscribeToTyping, sendTypingIndicator, sendChannelBroadcast } = useWebSocket()
  const user = useAuthStore((s) => s.user)

  const [newPost, setNewPost] = useState<string>('')
  const [postFormat, setPostFormat] = useState<PostFormat>('PLAIN')
  const [replyToPostId, setReplyToPostId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState<string>('')
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({})
  const typingTimeoutRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const [readPostIds, setReadPostIds] = useState<Set<number>>(new Set())

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'

  // Subscribe to real-time updates
  useEffect(() => {
    if (!threadId) return
    const unsubscribe = subscribeToChannelThread(threadId, () => {})
    return unsubscribe
  }, [threadId, subscribeToChannelThread])

  // Subscribe to typing indicators
  useEffect(() => {
    if (!threadId) return
    const unsubscribe = subscribeToTyping(threadId, (event) => {
      if (!event.userId || event.userId === user?.userId) return
      if (event.typing) {
        setTypingUsers((prev) => ({ ...prev, [event.userId]: event.userName || 'Someone' }))
        if (typingTimeoutRef.current[event.userId]) {
          clearTimeout(typingTimeoutRef.current[event.userId])
        }
        typingTimeoutRef.current[event.userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev }
            delete next[event.userId]
            return next
          })
        }, 3000)
      } else {
        setTypingUsers((prev) => {
          const next = { ...prev }
          delete next[event.userId]
          return next
        })
      }
    })
    return () => {
      unsubscribe()
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
    }
  }, [threadId, subscribeToTyping, user?.userId])

  const handlePost = () => {
    if (!newPost.trim()) return
    createPost.mutate(
      { content: newPost, format: postFormat },
      {
        onSuccess: () => setNewPost(''),
      }
    )
  }

  const handleReply = (postId: number) => {
    if (!replyContent.trim()) return
    createPost.mutate(
      { content: replyContent, format: postFormat, parentPostId: postId },
      {
        onSuccess: () => {
          setReplyContent('')
          setReplyToPostId(null)
        },
      }
    )
  }

  const handlePostInputChange = useCallback(
    (value: string) => {
      setNewPost(value)
      if (threadId && value.trim()) {
        sendTypingIndicator(threadId, true)
      }
    },
    [threadId, sendTypingIndicator]
  )

  const handleAtChannel = () => {
    const mention = '@channel '
    setNewPost((prev) => (prev ? `${prev} ${mention}` : mention))
    if (threadId) sendChannelBroadcast(threadId, '@channel mention composed')
  }

  // Find the current thread from channel data
  const thread = channel?.threads?.find((t) => String(t.id) === String(threadId))

  const postList: Post[] = Array.isArray(posts) ? posts : (posts as any)?.content || []

  // Mark visible posts as read (client-side stub until backend exposes read receipts).
  useEffect(() => {
    if (!postList.length) return
    setReadPostIds((prev) => {
      const next = new Set(prev)
      postList.forEach((p) => next.add(p.id))
      return next
    })
  }, [postList])

  const threadTitle = thread?.title || 'Thread'
  const threadSlug = thread?.slug || threadId
  const canonicalPath = `/channels/${channelId}/threads/${threadSlug}`
  const baseUrl = getBaseUrl()
  const threadUrl = `${baseUrl}${canonicalPath}`
  const jsonLd = [
    discussionForumPostingSchema({
      title: threadTitle,
      description: threadTitle,
      url: threadUrl,
      author: thread?.authorName || thread?.userName,
      datePublished: thread?.createdAt,
    }),
    breadcrumbSchema([
      { name: 'Channels', url: `${baseUrl}/channels` },
      { name: channel?.name || 'Channel', url: `${baseUrl}/channels` },
      { name: threadTitle, url: threadUrl },
    ]),
  ]

  return (
    <div className={styles.container}>
      <Seo
        title={`${threadTitle} — LernChih`}
        description={`Discussion: ${threadTitle} in ${channel?.name || 'a channel'} on LernChih.`}
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
        hreflang
      />
      {/* Back */}
      <div className={styles.backRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/channels')}>
          Back to Channels
        </Button>
      </div>

      {/* Thread info */}
      <div className={styles.threadInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, flexWrap: 'wrap' }}>
          <Title2 as="h1">{thread?.title || 'Thread'}</Title2>
          {threadId && <PresenceIndicator threadId={Number(threadId)} />}
        </div>
        <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>
          in {channel?.name || 'Channel'}
        </Body1>
        <ThreadBadges status={{ pinned: thread?.pinned, locked: thread?.locked, qaMode: thread?.qaMode }} />
      </div>

      {/* New post */}
      <div className={styles.newPostRow}>
        <Textarea
          value={newPost}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePostInputChange(e.target.value)}
          placeholder={thread?.locked ? 'This thread is locked.' : 'Write a reply...'}
          style={{ flex: 1 }}
          disabled={thread?.locked}
        />
        <Dropdown
          value={postFormat === 'MARKDOWN' ? 'Markdown' : 'Plain'}
          selectedOptions={[postFormat]}
          onOptionSelect={(_: unknown, data: { optionValue?: string }) =>
            setPostFormat((data.optionValue as PostFormat) || 'PLAIN')
          }
          disabled={thread?.locked}
        >
          <Option value="PLAIN">Plain</Option>
          <Option value="MARKDOWN">Markdown</Option>
        </Dropdown>
        {isAdmin && (
          <Button
            appearance="outline"
            icon={<Mention24Regular />}
            onClick={handleAtChannel}
            disabled={thread?.locked}
            title="Mention everyone in this channel"
          >
            @channel
          </Button>
        )}
        <Button
          appearance="primary"
          onClick={handlePost}
          disabled={createPost.isPending || !newPost.trim() || thread?.locked}
        >
          {createPost.isPending ? <Spinner size="tiny" /> : 'Reply'}
        </Button>
      </div>

      {/* Typing indicator */}
      <div className={styles.typingRow} aria-live="polite">
        {Object.keys(typingUsers).length > 0 && (
          <>
            <Spinner size="tiny" />
            <span>
              {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
            </span>
          </>
        )}
      </div>

      {/* Posts */}
      {isLoading && <Spinner label="Loading posts..." />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load posts.</MessageBarBody>
        </MessageBar>
      )}
      <div className={styles.postsList}>
        {postList.length === 0 && !isLoading && (
          <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No posts yet. Start the conversation!</Body1>
        )}
        {postList.map((post) => (
          <Card key={post.id} className={styles.postCard}>
            <div className={styles.postHeader}>
              <Avatar name={post.authorName || 'User'} size={32} />
              <div>
                <Subtitle2>{post.authorName || 'Unknown'}</Subtitle2>
                <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)', marginLeft: '8px' }}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                </span>
              </div>
            </div>
            {post.format === 'MARKDOWN' ? (
              <MarkdownPreview content={post.content} />
            ) : (
              <Body1>{post.content}</Body1>
            )}
            <div className={styles.postActions}>
              <ReactionPicker postId={post.id} />
              {!thread?.locked && (
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => {
                    setReplyToPostId(post.id)
                    setReplyContent('')
                  }}
                >
                  Reply
                </Button>
              )}
              <ReportButton targetType="CHANNEL_POST" targetId={post.id} />
              {readPostIds.has(post.id) && post.userId === user?.userId && (
                <span className={styles.readReceipt}>Read</span>
              )}
            </div>
            {replyToPostId === post.id && !thread?.locked && (
              <div className={styles.replyForm}>
                <Textarea
                  value={replyContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                />
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, justifyContent: 'flex-end' }}>
                  <Button appearance="secondary" size="small" onClick={() => setReplyToPostId(null)}>
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    size="small"
                    disabled={!replyContent.trim() || createPost.isPending}
                    onClick={() => handleReply(post.id)}
                  >
                    {createPost.isPending ? <Spinner size="tiny" /> : 'Post reply'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
