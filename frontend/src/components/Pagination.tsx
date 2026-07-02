import { Button } from '@fluentui/react-components'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Button appearance="subtle" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">
        ← Prev
      </Button>
      <span aria-current="page">Page {currentPage} of {totalPages}</span>
      <Button appearance="subtle" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
        Next →
      </Button>
    </nav>
  )
}
