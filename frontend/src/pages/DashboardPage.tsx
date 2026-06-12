import { useNavigate } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Subtitle2,
  Card,
  Badge,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import {
  Document24Regular,
  Chat24Regular,
  Trophy24Regular,
  ArrowRight24Regular,
} from '@fluentui/react-icons'
import useAuthStore from '../store/authStore'
import { useMyProfile } from '../hooks/useProfile'
import { useResources } from '../hooks/useResources'
import type { UserProfile, Resource } from '../types'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    maxWidth: '960px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  statCard: {
    padding: tokens.spacingHorizontalL,
  },
  statValue: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  quickLinkCard: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  quickLinkLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
  },
  cardMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    marginTop: tokens.spacingVerticalXS,
  },
})

export default function DashboardPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: resources, isLoading: resourcesLoading } = useResources({ page: '0', size: '6' })

  if (profileLoading || resourcesLoading) {
    return <Spinner label="Loading dashboard..." />
  }

  const recentResources: Resource[] = Array.isArray(resources) ? resources.slice(0, 6) : (resources as any)?.content?.slice(0, 6) || []

  return (
    <div className={styles.container}>
      {/* Welcome */}
      <div>
        <Title1>Welcome back, {user?.name || 'Student'}</Title1>
        <Subtitle2 style={{ color: 'var(--colorNeutralForeground2)', marginTop: '4px' }}>
          Here&apos;s what&apos;s happening in your academic community
        </Subtitle2>
      </div>

      {/* Quick stats */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <Subtitle2>Credits</Subtitle2>
          <div className={styles.statValue}>
            <Title3>{profile?.credits ?? 0}</Title3>
            <Badge appearance="filled" color="brand">pts</Badge>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <Subtitle2>Resources Uploaded</Subtitle2>
          <div className={styles.statValue}>
            <Title3>{profile?.resourceCount ?? 0}</Title3>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <Subtitle2>Upvotes Received</Subtitle2>
          <div className={styles.statValue}>
            <Title3>{profile?.upvoteCount ?? 0}</Title3>
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <Title3 style={{ marginBottom: '12px' }}>Quick Links</Title3>
        <div className={styles.quickLinks}>
          <Card
            className={styles.quickLinkCard}
            onClick={() => navigate('/resources')}
          >
            <div className={styles.quickLinkLeft}>
              <Document24Regular />
              <Subtitle2>Resources</Subtitle2>
            </div>
            <ArrowRight24Regular />
          </Card>
          <Card
            className={styles.quickLinkCard}
            onClick={() => navigate('/channels')}
          >
            <div className={styles.quickLinkLeft}>
              <Chat24Regular />
              <Subtitle2>Channels</Subtitle2>
            </div>
            <ArrowRight24Regular />
          </Card>
          <Card
            className={styles.quickLinkCard}
            onClick={() => navigate('/leaderboard')}
          >
            <div className={styles.quickLinkLeft}>
              <Trophy24Regular />
              <Subtitle2>Leaderboard</Subtitle2>
            </div>
            <ArrowRight24Regular />
          </Card>
        </div>
      </div>

      {/* Recent resources */}
      <div>
        <Title3 style={{ marginBottom: '12px' }}>Recent Resources</Title3>
        {recentResources.length === 0 ? (
          <MessageBar>
            <MessageBarBody>No resources yet. Be the first to upload!</MessageBarBody>
          </MessageBar>
        ) : (
          <div className={styles.recentGrid}>
            {recentResources.map((resource) => (
              <Card
                key={resource.id}
                className={styles.resourceCard}
                onClick={() => navigate(`/resources/${resource.id}`)}
              >
                <div className={styles.cardHeader}>
                  <Subtitle2>{resource.title}</Subtitle2>
                  <Badge appearance="tint" size="small">
                    {resource.category || 'General'}
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
