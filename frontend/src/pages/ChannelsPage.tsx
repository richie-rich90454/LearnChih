import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle2,
  Body1,
  Card,
  Badge,
  Button,
  Input,
  Textarea,
  Dropdown,
  Option,
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
import { Add24Regular } from '@fluentui/react-icons'
import { useChannels, useChannel, useCreateChannelThread } from '../hooks/useChannels'
import { useDebounce } from '../hooks/useDebounce'
import type { Channel, ChannelThread } from '../types'
import Seo from '../components/Seo'
import { Pagination } from '../components/Pagination'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '900px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterBar: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  channelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
  },
  channelCard: {
    padding: tokens.spacingHorizontalL,
    cursor: 'pointer',
  },
  channelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXS,
  },
  threadsSection: {
    marginTop: tokens.spacingVerticalL,
  },
  threadList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalS,
  },
  threadCard: {
    padding: tokens.spacingHorizontalM,
    cursor: 'pointer',
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
})

export default function ChannelsPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasQueryParams = searchParams.has('q') || searchParams.has('page')
  const { data: channels, isLoading, isError } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
  const { data: channelDetail } = useChannel(selectedChannelId)
  const createThread = useCreateChannelThread(selectedChannelId)

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [threadTitle, setThreadTitle] = useState<string>('')
  const [threadContent, setThreadContent] = useState<string>('')

  const channelList: Channel[] = Array.isArray(channels) ? channels : (channels as any)?.content || []
  const threads: ChannelThread[] = channelDetail?.threads || []

  const [threadSearch, setThreadSearch] = useState<string>('')
  const [threadSort, setThreadSort] = useState<'newest' | 'oldest' | 'posts'>('newest')
  const [threadPage, setThreadPage] = useState<number>(1)
  const debouncedThreadSearch = useDebounce(threadSearch, 250)
  const THREAD_PAGE_SIZE = 8

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (!debouncedThreadSearch) return true
      const q = debouncedThreadSearch.toLowerCase()
      return (
        t.title?.toLowerCase().includes(q) ||
        t.authorName?.toLowerCase().includes(q)
      )
    })
  }, [threads, debouncedThreadSearch])

  const sortedThreads = useMemo(() => {
    const arr = [...filteredThreads]
    if (threadSort === 'newest') {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (threadSort === 'oldest') {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      arr.sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0))
    }
    return arr
  }, [filteredThreads, threadSort])

  const threadTotalPages = Math.ceil(sortedThreads.length / THREAD_PAGE_SIZE)
  const paginatedThreads = sortedThreads.slice(
    (threadPage - 1) * THREAD_PAGE_SIZE,
    threadPage * THREAD_PAGE_SIZE
  )

  useEffect(() => {
    setThreadPage(1)
  }, [debouncedThreadSearch, threadSort, selectedChannelId])

  const handleCreateThread = () => {
    if (!threadTitle.trim()) return
    createThread.mutate(
      { title: threadTitle, content: threadContent },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setThreadTitle('')
          setThreadContent('')
        },
      }
    )
  }

  return (
    <div className={styles.container}>
      <Seo
        title="Channels — LernChih"
        description="Join subject-specific discussion channels on LernChih. Ask questions, share insights, and collaborate with your academic community."
        canonicalPath="/channels"
        robots={hasQueryParams ? 'noindex, follow' : 'index, follow'}
        hreflang
      />
      <div className={styles.headerRow}>
        <Title2 as="h1">Channels</Title2>
        {selectedChannelId && (
          <Dialog open={dialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setDialogOpen(d.open)}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" icon={<Add24Regular />}>New Thread</Button>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Create Thread</DialogTitle>
                <DialogContent>
                  {createThread.isError && (
                    <MessageBar intent="error">
                      <MessageBarBody>Failed to create thread.</MessageBarBody>
                    </MessageBar>
                  )}
                  <div className={styles.dialogForm}>
                    <Field label="Title" required>
                      <Input value={threadTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreadTitle(e.target.value)} placeholder="Thread title" />
                    </Field>
                    <Field label="Content">
                      <Textarea value={threadContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setThreadContent(e.target.value)} placeholder="First post content" />
                    </Field>
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button appearance="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button appearance="primary" onClick={handleCreateThread} disabled={createThread.isPending || !threadTitle.trim()}>
                    {createThread.isPending ? <Spinner size="tiny" /> : 'Create'}
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        )}
      </div>

      {isLoading && <Spinner label="Loading channels..." />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load channels.</MessageBarBody>
        </MessageBar>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Channel list */}
        <div className={styles.channelList} style={{ flex: 1, minWidth: '280px' }}>
          {channelList.length === 0 && !isLoading && (
            <MessageBar>
              <MessageBarBody>No channels available.</MessageBarBody>
            </MessageBar>
          )}
          {channelList.map((channel) => (
            <Card
              key={channel.id}
              className={styles.channelCard}
              style={{
                backgroundColor: selectedChannelId === channel.id ? 'var(--colorNeutralBackground1Selected)' : undefined,
              }}
              onClick={() => setSelectedChannelId(channel.id)}
            >
              <div className={styles.channelHeader}>
                <Subtitle2>{channel.name}</Subtitle2>
                <Badge appearance="outline" size="small">
                  {channel.threadCount ?? 0} threads
                </Badge>
              </div>
              {channel.description && (
                <Body1 style={{ color: 'var(--colorNeutralForeground3)', marginTop: '4px', display: 'block' }}>
                  {channel.description}
                </Body1>
              )}
            </Card>
          ))}
        </div>

        {/* Threads for selected channel */}
        {selectedChannelId && (
          <div className={styles.threadsSection} style={{ flex: 2 }}>
            <Subtitle2 as="h2" style={{ marginBottom: '12px' }}>
              {channelDetail?.name || 'Channel'} — Threads
            </Subtitle2>
            <div className={styles.filterBar} style={{ marginBottom: '12px' }}>
              <Input
                placeholder="Search threads..."
                value={threadSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreadSearch(e.target.value)}
                style={{ minWidth: '180px' }}
              />
              <Dropdown
                placeholder="Sort by"
                value={threadSort === 'newest' ? 'Newest' : threadSort === 'oldest' ? 'Oldest' : 'Most Posts'}
                selectedOptions={[threadSort]}
                onOptionSelect={(_: unknown, data: { optionValue?: string }) => data.optionValue && setThreadSort(data.optionValue as 'newest' | 'oldest' | 'posts')}
              >
                <Option value="newest">Newest</Option>
                <Option value="oldest">Oldest</Option>
                <Option value="posts">Most Posts</Option>
              </Dropdown>
            </div>
            <div className={styles.threadList}>
              {threads.length === 0 && (
                <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No threads yet. Start one!</Body1>
              )}
              {threads.length > 0 && sortedThreads.length === 0 && (
                <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No threads match your search.</Body1>
              )}
              {/* TODO(perf): When threads exceed ~100 items, add list
                  virtualization (e.g. react-window / react-virtual) to avoid
                  rendering off-screen cards. Not added now to keep the change
                  dependency-free. Keys are already stable (thread.id). */}
              {paginatedThreads.map((thread) => (
                <Card
                  key={thread.id}
                  className={styles.threadCard}
                  onClick={() => navigate(`/channels/${selectedChannelId}/threads/${thread.id}`)}
                >
                  <Subtitle2>{thread.title}</Subtitle2>
                  <div className={styles.channelMeta}>
                    <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
                      by {thread.authorName || 'Unknown'}
                    </span>
                    <Badge appearance="outline" size="small">
                      {thread.postCount ?? 0} posts
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination
              currentPage={threadPage}
              totalPages={threadTotalPages}
              onPageChange={setThreadPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
