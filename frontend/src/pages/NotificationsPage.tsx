import { useNavigate } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Card,
  Button,
  Text,
  Caption1,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import { Checkmark24Regular, ArrowLeft24Regular } from '@fluentui/react-icons'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/notifications'
import { useNotificationStore } from '@/store/notificationStore'
import Seo from '@/components/Seo'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '700px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  notificationCard: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    cursor: 'pointer',
  },
  unread: {
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
  },
})

export default function NotificationsPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore()

  const { data: notificationsData, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then((r) => r.data),
  })

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData)
    }
  }, [notificationsData, setNotifications])

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: (_, id) => {
      markAsRead(id)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      markAllAsRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleClick = (id: number, link?: string) => {
    markReadMutation.mutate(id)
    if (link) navigate(link)
  }

  return (
    <div className={styles.container}>
      <Seo title="Notifications — LernChih" canonicalPath="/notifications" robots="noindex, follow" />
      <div className={styles.headerRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Title2 as="h1">Notifications</Title2>
        {notifications.some((n) => !n.read) && (
          <Button
            appearance="outline"
            icon={<Checkmark24Regular />}
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading && notifications.length === 0 && <Spinner label="Loading notifications..." />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load notifications.</MessageBarBody>
        </MessageBar>
      )}
      {!isLoading && notifications.length === 0 && (
        <MessageBar>
          <MessageBarBody>No notifications yet.</MessageBarBody>
        </MessageBar>
      )}

      {notifications.map((n) => (
        <Card
          key={n.id}
          className={`${styles.notificationCard} ${!n.read ? styles.unread : ''}`}
          onClick={() => handleClick(n.id, n.link)}
        >
          <Text weight={n.read ? 'regular' : 'semibold'}>{n.title}</Text>
          <Text style={{ color: 'var(--colorNeutralForeground3)' }}>{n.message}</Text>
          <Caption1 style={{ color: 'var(--colorNeutralForeground3)' }}>
            {new Date(n.createdAt).toLocaleString()}
          </Caption1>
        </Card>
      ))}
    </div>
  )
}
