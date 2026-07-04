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
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import {
  Document24Regular,
  Chat24Regular,
  Trophy24Regular,
  ArrowRight24Regular,
} from '@fluentui/react-icons'
import useAuthStore from '@/store/authStore'
import { useMyProfile } from '@/hooks/useProfile'
import { useResources } from '@/hooks/useResources'
import { useTranslation } from 'react-i18next'
import type { UserProfile, Resource } from '@/types'
import Seo from '@/components/Seo'
import { SkeletonLine, SkeletonList } from '@/components/Skeleton'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { StaggerReveal } from '@/components/StaggerReveal'
import { HoverLift } from '@/components/HoverLift'

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
  const { t } = useTranslation()
  const styles = useStyles()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useMyProfile()
  const { data: resources, isLoading: resourcesLoading, isError: resourcesError, refetch: refetchResources } = useResources({ page: '0', size: '6' })

  if (profileLoading || resourcesLoading) {
    return (
      <div className={styles.container}>
        <SkeletonLine width="40%" />
        <div className={styles.statsRow}>
          <Card className={styles.statCard}><SkeletonLine width="50%" /><SkeletonLine /></Card>
          <Card className={styles.statCard}><SkeletonLine width="50%" /><SkeletonLine /></Card>
          <Card className={styles.statCard}><SkeletonLine width="50%" /><SkeletonLine /></Card>
        </div>
        <SkeletonList count={3} />
      </div>
    )
  }

  if (profileError || resourcesError) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: 48 }}>
        <Title3 as="h3">{t('dashboard.loadError')}</Title3>
        <p style={{ marginBottom: 12 }}>{t('errors.generic')}</p>
        <Button appearance="primary" onClick={() => { refetchProfile(); refetchResources() }}>{t('errors.retry')}</Button>
      </div>
    )
  }

  const recentResources: Resource[] = Array.isArray(resources) ? resources.slice(0, 6) : (resources as any)?.content?.slice(0, 6) || []

  return (
    <div className={styles.container}>
      <Seo
        title={`${t('nav.dashboard')} — LernChih`}
        description={t('dashboard.description')}
        canonicalPath="/"
        hreflang
      />
      {/* Welcome */}
      <div>
        <Title1 as="h1">{t('dashboard.welcome', { name: user?.name || t('common.student') })}</Title1>
        <Subtitle2 style={{ color: 'var(--colorNeutralForeground2)', marginTop: '4px' }}>
          {t('dashboard.subtitle')}
        </Subtitle2>
      </div>

      {/* Quick stats */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <Subtitle2>{t('dashboard.credits')}</Subtitle2>
          <div className={styles.statValue}>
            <Title3><AnimatedCounter value={profile?.credits ?? 0} /></Title3>
            <Badge appearance="filled" color="brand">{t('dashboard.points')}</Badge>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <Subtitle2>{t('dashboard.resourcesUploaded')}</Subtitle2>
          <div className={styles.statValue}>
            <Title3><AnimatedCounter value={profile?.resourceCount ?? 0} /></Title3>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <Subtitle2>{t('dashboard.upvotesReceived')}</Subtitle2>
          <div className={styles.statValue}>
            <Title3><AnimatedCounter value={profile?.upvoteCount ?? 0} /></Title3>
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <Title3 as="h2" style={{ marginBottom: '12px' }}>{t('dashboard.quickLinks')}</Title3>
        <StaggerReveal className={styles.quickLinks}>
          <HoverLift>
            <Card
              className={styles.quickLinkCard}
              onClick={() => navigate('/resources')}
            >
              <div className={styles.quickLinkLeft}>
                <Document24Regular />
                <Subtitle2>{t('nav.resources')}</Subtitle2>
              </div>
              <ArrowRight24Regular />
            </Card>
          </HoverLift>
          <HoverLift>
            <Card
              className={styles.quickLinkCard}
              onClick={() => navigate('/channels')}
            >
              <div className={styles.quickLinkLeft}>
                <Chat24Regular />
                <Subtitle2>{t('nav.channels')}</Subtitle2>
              </div>
              <ArrowRight24Regular />
            </Card>
          </HoverLift>
          <HoverLift>
            <Card
              className={styles.quickLinkCard}
              onClick={() => navigate('/leaderboard')}
            >
              <div className={styles.quickLinkLeft}>
                <Trophy24Regular />
                <Subtitle2>{t('nav.leaderboard')}</Subtitle2>
              </div>
              <ArrowRight24Regular />
            </Card>
          </HoverLift>
        </StaggerReveal>
      </div>

      {/* Recent resources */}
      <div>
        <Title3 as="h2" style={{ marginBottom: '12px' }}>{t('dashboard.recentResources')}</Title3>
        {recentResources.length === 0 ? (
          <MessageBar>
            <MessageBarBody>{t('dashboard.noResources')}</MessageBarBody>
          </MessageBar>
        ) : (
          <StaggerReveal className={styles.recentGrid}>
            {recentResources.map((resource) => (
              <HoverLift key={resource.id}>
                <Card
                  className={styles.resourceCard}
                  onClick={() => navigate(`/resources/${resource.id}`)}
                >
                  <div className={styles.cardHeader}>
                    <Subtitle2>{resource.title}</Subtitle2>
                    <Badge appearance="tint" size="small">
                      {resource.category || t('resources.general')}
                    </Badge>
                  </div>
                  <div className={styles.cardMeta}>
                    <span style={{ fontSize: 'var(--fontSizeBase200)', color: 'var(--colorNeutralForeground3)' }}>
                      {t('common.byAuthor', { author: resource.authorName || t('common.unknown') })}
                    </span>
                    <Badge appearance="outline" size="small">
                      <AnimatedCounter value={resource.upvoteCount ?? 0} suffix={` ${t('resources.upvotes')}`} />
                    </Badge>
                  </div>
                </Card>
              </HoverLift>
            ))}
          </StaggerReveal>
        )}
      </div>
    </div>
  )
}
