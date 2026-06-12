import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import type { Channel, ChannelThread } from '../types'

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
  const { data: channels, isLoading, isError } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
  const { data: channelDetail } = useChannel(selectedChannelId)
  const createThread = useCreateChannelThread(selectedChannelId)

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [threadTitle, setThreadTitle] = useState<string>('')
  const [threadContent, setThreadContent] = useState<string>('')

  const channelList: Channel[] = Array.isArray(channels) ? channels : (channels as any)?.content || []
  const threads: ChannelThread[] = channelDetail?.threads || []

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
      <div className={styles.headerRow}>
        <Title2>Channels</Title2>
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

      <div style={{ display: 'flex', gap: '24px' }}>
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
            <Subtitle2 style={{ marginBottom: '12px' }}>
              {channelDetail?.name || 'Channel'} — Threads
            </Subtitle2>
            <div className={styles.threadList}>
              {threads.length === 0 && (
                <Body1 style={{ color: 'var(--colorNeutralForeground3)' }}>No threads yet. Start one!</Body1>
              )}
              {threads.map((thread) => (
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
          </div>
        )}
      </div>
    </div>
  )
}
