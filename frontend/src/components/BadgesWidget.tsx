import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Badge,
  makeStyles,
  tokens,
  Spinner,
  MessageBar,
  MessageBarBody,
  Body1,
  Title3,
} from '@fluentui/react-components'
import { Trophy24Regular } from '@fluentui/react-icons'
import api from '../api/axios'

export interface BadgeItem {
  id: number
  name: string
  description: string
  icon?: string
  earned: boolean
  earnedAt?: string
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  badgeCard: {
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    textAlign: 'center',
    opacity: 1,
  },
  locked: {
    opacity: 0.5,
  },
  icon: {
    fontSize: '32px',
  },
})

function fetchBadges(): Promise<BadgeItem[]> {
  return api.get<BadgeItem[]>('/badges').then((r) => r.data)
}

interface BadgesWidgetProps {
  userId?: number
}

/**
 * Fetches /api/badges and shows earned vs locked badges.
 *
 * Spec refs: F5.41–F5.48.
 */
export function BadgesWidget({ userId }: BadgesWidgetProps) {
  const styles = useStyles()
  const { data, isLoading, isError } = useQuery<BadgeItem[]>({
    queryKey: ['badges', userId],
    queryFn: fetchBadges,
  })

  if (isLoading) return <Spinner size="tiny" label="Loading badges..." />
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load badges.</MessageBarBody>
      </MessageBar>
    )
  }

  const badges = data ?? []
  if (badges.length === 0) {
    return <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No badges yet.</Body1>
  }

  return (
    <div className={styles.root}>
      <Title3 as="h3">Badges</Title3>
      <div className={styles.grid}>
        {badges.map((badge) => (
          <Card
            key={badge.id}
            className={`${styles.badgeCard} ${badge.earned ? '' : styles.locked}`}
          >
            <div className={styles.icon}>{badge.icon || <Trophy24Regular />}</div>
            <Badge appearance={badge.earned ? 'filled' : 'outline'} color={badge.earned ? 'brand' : 'subtle'}>
              {badge.earned ? 'Earned' : 'Locked'}
            </Badge>
            <Body1>{badge.name}</Body1>
            <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: 'var(--fontSizeBase200)' }}>
              {badge.description}
            </Body1>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BadgesWidget
