import { useState } from 'react'
import {
  makeStyles,
  tokens,
  Title2,
  Subtitle2,
  Body1,
  Badge,
  Button,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridCell,
  DataGridBody,
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
} from '@fluentui/react-components'
import { Shield24Regular, Checkmark24Regular, Delete24Regular } from '@fluentui/react-icons'
import { useReports, useResolveReport, useDeleteResourceAdmin, useDeletePostAdmin } from '../hooks/useReports'
import useAuthStore from '../store/authStore'
import type { Report } from '../types'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '1000px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  filterRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
  },
})

const STATUS_OPTIONS = ['PENDING', 'RESOLVED', 'DISMISSED']

const columns = [
  { columnId: 'id', renderHeaderCell: () => 'ID' as const, minWidth: 60 },
  { columnId: 'reporter', renderHeaderCell: () => 'Reporter' as const, minWidth: 120 },
  { columnId: 'target', renderHeaderCell: () => 'Target' as const, minWidth: 150 },
  { columnId: 'reason', renderHeaderCell: () => 'Reason' as const, minWidth: 200 },
  { columnId: 'status', renderHeaderCell: () => 'Status' as const, minWidth: 100 },
  { columnId: 'actions', renderHeaderCell: () => 'Actions' as const, minWidth: 200 },
]

export default function AdminPage() {
  const styles = useStyles()
  const user = useAuthStore((s) => s.user)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: string } | null>(null)

  const params: Record<string, string> = {}
  if (statusFilter) params.status = statusFilter

  const { data, isLoading, isError } = useReports(params)
  const resolveReport = useResolveReport()
  const deleteResource = useDeleteResourceAdmin()
  const deletePost = useDeletePostAdmin()

  // Only admins and moderators can access
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR'

  const reports: Report[] = Array.isArray(data) ? data : (data as any)?.content || []

  const handleResolve = (id: number) => {
    resolveReport.mutate(id)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'RESOURCE') {
      deleteResource.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      })
    } else if (deleteTarget.type === 'POST') {
      deletePost.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      })
    }
  }

  if (!isAdmin) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>You don&apos;t have permission to access this page.</MessageBarBody>
      </MessageBar>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Shield24Regular />
        <Title2>Admin Panel</Title2>
      </div>

      {/* Filter */}
      <div className={styles.filterRow}>
        <Dropdown
          placeholder="Filter by status"
          value={statusFilter || undefined}
          selectedOptions={statusFilter ? [statusFilter] : []}
          onOptionSelect={(_: unknown, d: { optionValue?: string }) => setStatusFilter(d.optionValue || '')}
          clearable
        >
          {STATUS_OPTIONS.map((s) => (
            <Option key={s} value={s}>{s}</Option>
          ))}
        </Dropdown>
      </div>

      {isLoading && <Spinner label="Loading reports..." />}
      {isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load reports.</MessageBarBody>
        </MessageBar>
      )}

      {!isLoading && reports.length === 0 && (
        <MessageBar>
          <MessageBarBody>No reports found.</MessageBarBody>
        </MessageBar>
      )}

      {!isLoading && reports.length > 0 && (
        <DataGrid items={reports} columns={columns as any} style={{ minWidth: '800px' }}>
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridCell>{renderHeaderCell()}</DataGridCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody>
            {({ item, rowId }: { item: Report; rowId: any }) => (
              <DataGridRow key={rowId}>
                {({ columnId }) => {
                  if (columnId === 'id') {
                    return <DataGridCell><Body1>{item.id}</Body1></DataGridCell>
                  }
                  if (columnId === 'reporter') {
                    return <DataGridCell><Body1>{item.reporterName || 'Unknown'}</Body1></DataGridCell>
                  }
                  if (columnId === 'target') {
                    return (
                      <DataGridCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Badge appearance="outline" size="small">{item.targetType || 'N/A'}</Badge>
                          <Body1>{item.targetTitle || item.targetId || 'N/A'}</Body1>
                        </div>
                      </DataGridCell>
                    )
                  }
                  if (columnId === 'reason') {
                    return <DataGridCell><Body1>{item.reason || 'No reason provided'}</Body1></DataGridCell>
                  }
                  if (columnId === 'status') {
                    const color = item.status === 'RESOLVED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'informative'
                    return (
                      <DataGridCell>
                        <Badge appearance="tint" color={color}>{item.status}</Badge>
                      </DataGridCell>
                    )
                  }
                  if (columnId === 'actions') {
                    return (
                      <DataGridCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {item.status === 'PENDING' && (
                            <Button
                              appearance="subtle"
                              icon={<Checkmark24Regular />}
                              size="small"
                              onClick={() => handleResolve(item.id)}
                            >
                              Resolve
                            </Button>
                          )}
                          <Button
                            appearance="subtle"
                            icon={<Delete24Regular />}
                            size="small"
                            color="danger"
                            onClick={() => {
                              setDeleteTarget({ id: item.targetId, type: item.targetType })
                              setDeleteDialogOpen(true)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(_: unknown, d: { open: boolean }) => setDeleteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Body1>Are you sure you want to delete this {deleteTarget?.type?.toLowerCase() || 'content'}? This action cannot be undone.</Body1>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button
                appearance="primary"
                color="danger"
                onClick={handleDelete}
                disabled={deleteResource.isPending || deletePost.isPending}
              >
                {deleteResource.isPending || deletePost.isPending ? <Spinner size="tiny" /> : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}
