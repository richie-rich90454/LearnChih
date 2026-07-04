import {
  makeStyles,
  tokens,
  Title2,
  Title3,
  Subtitle2,
  Body1,
  Avatar,
  Badge,
  Button,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridCell,
  DataGridBody,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import { Trophy24Regular } from '@fluentui/react-icons'
import { useTranslation } from 'react-i18next'
import { useLeaderboard } from '../hooks/useResources'
import type { LeaderboardEntry } from '../types'
import Seo from '../components/Seo'
import { SkeletonLine, SkeletonList } from '../components/Skeleton'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '800px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
})

export default function LeaderboardPage() {
  const styles = useStyles()
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useLeaderboard()

  const columns = [
    { columnId: 'rank', renderHeaderCell: () => t('leaderboard.rank'), minWidth: 80 },
    { columnId: 'user', renderHeaderCell: () => t('leaderboard.user'), minWidth: 250 },
    { columnId: 'credits', renderHeaderCell: () => t('leaderboard.credits'), minWidth: 120 },
  ]

  if (isLoading) {
    return (
      <main className={styles.container}>
        <SkeletonLine width="40%" />
        <SkeletonList count={5} />
      </main>
    )
  }
  if (isError) {
    return (
      <main role="alert" style={{ textAlign: 'center', padding: 48 }}>
        <Title3 as="h3">{t('leaderboard.loadError')}</Title3>
        <p style={{ marginBottom: 12 }}>{t('errors.generic')}</p>
        <Button appearance="primary" onClick={() => refetch()}>{t('common.retry')}</Button>
      </main>
    )
  }

  const users: LeaderboardEntry[] = Array.isArray(data) ? data : (data as any)?.content || []

  return (
    <main className={styles.container}>
      <Seo
        title={`${t('leaderboard.title')} — LernChih`}
        description={t('leaderboard.description')}
        canonicalPath="/leaderboard"
        hreflang
      />
      <div className={styles.headerRow}>
        <Trophy24Regular />
        <Title2 as="h1">{t('leaderboard.title')}</Title2>
      </div>

      {users.length === 0 ? (
        <MessageBar>
          <MessageBarBody>{t('leaderboard.empty')}</MessageBarBody>
        </MessageBar>
      ) : (
        <DataGrid items={users.slice(0, 50)} columns={columns as any} style={{ minWidth: '500px' }}>
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridCell>{renderHeaderCell()}</DataGridCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {({ item, rowId }: { item: LeaderboardEntry; rowId: any }) => (
              <DataGridRow key={rowId}>
                {({ columnId }) => {
                  const rank = users.indexOf(item) + 1
                  if (columnId === 'rank') {
                    return (
                      <DataGridCell>
                        {rank <= 3 ? (
                          <Badge appearance="filled" color="brand" size="large">
                            #{rank}
                          </Badge>
                        ) : (
                          <Body1>#{rank}</Body1>
                        )}
                      </DataGridCell>
                    )
                  }
                  if (columnId === 'user') {
                    return (
                      <DataGridCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={item.name || t('common.user')} size={28} />
                          <Subtitle2>{item.name || t('common.unknown')}</Subtitle2>
                        </div>
                      </DataGridCell>
                    )
                  }
                  if (columnId === 'credits') {
                    return (
                      <DataGridCell>
                        <Badge appearance="tint" color="brand">
                          {item.credits ?? 0}
                        </Badge>
                      </DataGridCell>
                    )
                  }
                  return <DataGridCell>-</DataGridCell>
                }}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      )}
    </main>
  )
}
