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
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useChannel, useChannelPosts, useCreateChannelPost } from '../hooks/useChannels'
import useWebSocket from '../hooks/useWebSocket'
import type { Post } from '../types'

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
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
})

export default function ChannelThreadPage() {
  const styles = useStyles()
  const { channelId, threadId } = useParams<{ channelId: string; threadId: string }>()
  const navigate = useNavigate()
  const { data: channel } = useChannel(channelId ? Number(channelId) : undefined)
  const { data: posts, isLoading, isError } = useChannelPosts(channelId ? Number(channelId) : undefined, threadId)
  const createPost = useCreateChannelPost(channelId ? Number(channelId) : undefined, threadId)
  const { subscribeToChannelThread } = useWebSocket()

  const [newPost, setNewPost] = useState<string>('')

  // Subscribe to real-time updates
  useEffect(() => {
    if (!threadId) return
    const unsubscribe = subscribeToChannelThread(threadId, () => {})
    return unsubscribe
  }, [threadId, subscribeToChannelThread])

  const handlePost = () => {
    if (!newPost.trim()) return
    createPost.mutate(newPost, {
      onSuccess: () => setNewPost(''),
    })
  }

  // Find the current thread from channel data
  const thread = channel?.threads?.find((t) => String(t.id) === String(threadId))

  const postList: Post[] = Array.isArray(posts) ? posts : (posts as any)?.content || []

  return (
    <div className={styles.container}>
      {/* Back */}
      <div className={styles.backRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/channels')}>
          Back to Channels
        </Button>
      </div>

      {/* Thread info */}
      <div className={styles.threadInfo}>
        <Title2>{thread?.title || 'Thread'}</Title2>
        <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>
          in {channel?.name || 'Channel'}
        </Body1>
      </div>

      {/* New post */}
      <div className={styles.newPostRow}>
        <Textarea
          value={newPost}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost(e.target.value)}
          placeholder="Write a reply..."
          style={{ flex: 1 }}
        />
        <Button
          appearance="primary"
          onClick={handlePost}
          disabled={createPost.isPending || !newPost.trim()}
        >
          {createPost.isPending ? <Spinner size="tiny" /> : 'Reply'}
        </Button>
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
            <Body1>{post.content}</Body1>
          </Card>
        ))}
      </div>
    </div>
  )
}
