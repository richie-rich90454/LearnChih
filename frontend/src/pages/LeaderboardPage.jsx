import {
  makeStyles,
  tokens,
  Title2,
  Subtitle2,
  Body1,
  Avatar,
  Badge,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridCell,
  DataGridBody,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { Trophy24Regular } from '@fluentui/react-icons';
import { useLeaderboard } from '../hooks/useResources';

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
});

const columns = [
  { columnId: 'rank', renderHeaderCell: () => 'Rank', minWidth: 80 },
  { columnId: 'user', renderHeaderCell: () => 'User', minWidth: 250 },
  { columnId: 'credits', renderHeaderCell: () => 'Credits', minWidth: 120 },
];

export default function LeaderboardPage() {
  const styles = useStyles();
  const { data, isLoading, isError } = useLeaderboard();

  if (isLoading) return <Spinner label="Loading leaderboard..." />;
  if (isError) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load leaderboard.</MessageBarBody>
      </MessageBar>
    );
  }

  const users = Array.isArray(data) ? data : data?.content || [];

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Trophy24Regular />
        <Title2>Leaderboard</Title2>
      </div>

      {users.length === 0 ? (
        <MessageBar>
          <MessageBarBody>No users on the leaderboard yet.</MessageBarBody>
        </MessageBar>
      ) : (
        <DataGrid items={users.slice(0, 50)} columns={columns} style={{ minWidth: '500px' }}>
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridCell>{renderHeaderCell()}</DataGridCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {({ item, rowId }) => (
              <DataGridRow key={rowId}>
                {({ columnId }) => {
                  const rank = users.indexOf(item) + 1;
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
                    );
                  }
                  if (columnId === 'user') {
                    return (
                      <DataGridCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={item.name || 'User'} size={28} />
                          <Subtitle2>{item.name || 'Unknown'}</Subtitle2>
                        </div>
                      </DataGridCell>
                    );
                  }
                  if (columnId === 'credits') {
                    return (
                      <DataGridCell>
                        <Badge appearance="tint" color="brand">
                          {item.credits ?? 0}
                        </Badge>
                      </DataGridCell>
                    );
                  }
                  return <DataGridCell>-</DataGridCell>;
                }}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      )}
    </div>
  );
}
