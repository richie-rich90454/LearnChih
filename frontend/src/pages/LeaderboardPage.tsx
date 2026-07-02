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

const columns = [
  { columnId: 'rank', renderHeaderCell: () => 'Rank' as const, minWidth: 80 },
  { columnId: 'user', renderHeaderCell: () => 'User' as const, minWidth: 250 },
  { columnId: 'credits', renderHeaderCell: () => 'Credits' as const, minWidth: 120 },
]

export default function LeaderboardPage() {
  const styles = useStyles()
  const { data, isLoading, isError, refetch } = useLeaderboard()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <SkeletonLine width="40%" />
        <SkeletonList count={5} />
      </div>
    )
  }
  if (isError) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: 48 }}>
        <Title3 as="h3">Failed to load leaderboard</Title3>
        <p style={{ marginBottom: 12 }}>Something went wrong. Please try again.</p>
        <Button appearance="primary" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const users: LeaderboardEntry[] = Array.isArray(data) ? data : (data as any)?.content || []

  return (
    <div className={styles.container}>
      <Seo
        title="Leaderboard — LernChih"
        description="See the top contributors on the LernChih leaderboard, ranked by credits earned through sharing resources and helping the community."
        canonicalPath="/leaderboard"
        hreflang
      />
      <div className={styles.headerRow}>
        <Trophy24Regular />
        <Title2 as="h1">Leaderboard</Title2>
      </div>

      {users.length === 0 ? (
        <MessageBar>
          <MessageBarBody>No users on the leaderboard yet.</MessageBarBody>
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
                          <Avatar name={item.name || 'User'} size={28} />
                          <Subtitle2>{item.name || 'Unknown'}</Subtitle2>
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
    </div>
  )
}
