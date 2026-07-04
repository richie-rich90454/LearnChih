import { useState, useEffect } from 'react'
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
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { StaggerReveal } from './StaggerReveal'
import { HoverLift } from './HoverLift'
import { MilestoneConfetti } from './MilestoneConfetti'

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
  const { t } = useTranslation()
  const styles = useStyles()
  const reduced = useReducedMotion()
  const [confetti, setConfetti] = useState(false)
  const { data, isLoading, isError } = useQuery<BadgeItem[]>({
    queryKey: ['badges', userId],
    queryFn: fetchBadges,
  })

  useEffect(() => {
    if (!data || data.length === 0) return
    const earned = data.filter((b) => b.earned).length
    const previous = Number(sessionStorage.getItem('lernchih-earned-count'))
    if (!Number.isNaN(previous) && earned > previous && !reduced) {
      setConfetti(true)
    }
    sessionStorage.setItem('lernchih-earned-count', String(earned))
  }, [data, reduced])

  if (isLoading) return <Spinner size="tiny" label={t('badges.loading')} />
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>{t('badges.loadError')}</MessageBarBody>
      </MessageBar>
    )
  }

  const badges = data ?? []
  if (badges.length === 0) {
    return <Body1 style={{ color: tokens.colorNeutralForeground3 }}>{t('badges.noBadges')}</Body1>
  }

  return (
    <div className={styles.root}>
      <MilestoneConfetti active={confetti} onComplete={() => setConfetti(false)} />
      <Title3 as="h3">{t('badges.title')}</Title3>
      <StaggerReveal className={styles.grid} staggerSeconds={0.04}>
        {badges.map((badge) => (
          <HoverLift key={badge.id}>
            <Card
              className={`${styles.badgeCard} ${badge.earned ? '' : styles.locked}`}
            >
              <div className={styles.icon}>{badge.icon || <Trophy24Regular />}</div>
              <Badge appearance={badge.earned ? 'filled' : 'outline'} color={badge.earned ? 'brand' : 'subtle'}>
                {badge.earned ? t('badges.earned') : t('badges.locked')}
              </Badge>
              <Body1>{badge.name}</Body1>
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: 'var(--fontSizeBase200)' }}>
                {badge.description}
              </Body1>
            </Card>
          </HoverLift>
        ))}
      </StaggerReveal>
    </div>
  )
}

export default BadgesWidget
