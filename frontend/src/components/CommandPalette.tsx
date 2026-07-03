import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogContent,
  Input,
  makeStyles,
  tokens,
  Body1,
  Caption1,
  Badge,
  Divider,
} from '@fluentui/react-components'
import { Search24Regular } from '@fluentui/react-icons'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearch } from '@/hooks/useSearch'
import type { SearchResult } from '@/hooks/useSearch'

const useStyles = makeStyles({
  surface: {
    maxWidth: '600px',
    width: '90vw',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusSmall,
    '&:hover, &:focus': {
      background: tokens.colorNeutralBackground1Hover,
      outline: 'none',
    },
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  sectionLabel: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    color: tokens.colorNeutralForeground3,
  },
  empty: {
    padding: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
})

interface Shortcut {
  label: string
  path: string
  hint: string
}

const NAV_SHORTCUTS: Shortcut[] = [
  { label: 'Dashboard', path: '/', hint: 'Go to dashboard' },
  { label: 'Resources', path: '/resources', hint: 'Browse resources' },
  { label: 'Channels', path: '/channels', hint: 'Browse channels' },
  { label: 'Leaderboard', path: '/leaderboard', hint: 'View leaderboard' },
  { label: 'Profile', path: '/profile', hint: 'Your profile' },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * A Cmd/Ctrl+K command palette combining quick navigation shortcuts with
 * live search results. The parent controls open state and is responsible
 * for registering the global keydown listener (see `useCommandPaletteShortcut`).
 *
 * Spec ref: F2.14.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const styles = useStyles()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 200)
  const { data, isFetching } = useSearch(debouncedQuery)
  const results: SearchResult[] = data?.content ?? []

  // Focus the input whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      // Defer focus until after the surface mounts.
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const go = useCallback(
    (path: string) => {
      onOpenChange(false)
      navigate(path)
    },
    [navigate, onOpenChange]
  )

  const showSearch = query.trim().length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(_e, data) => onOpenChange(data.open)}
      modalType="non-modal"
    >
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <Input
            ref={inputRef}
            value={query}
            onChange={(_e, data) => setQuery(data.value)}
            placeholder="Type a command or search..."
            contentBefore={<Search24Regular />}
            aria-label="Command palette"
          />
          <DialogContent className={styles.list}>
            {!showSearch && (
              <>
                <div className={styles.sectionLabel}>Quick navigation</div>
                {NAV_SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.path}
                    className={styles.item}
                    role="button"
                    tabIndex={0}
                    onClick={() => go(shortcut.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go(shortcut.path)
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <Body1>{shortcut.label}</Body1>
                    </div>
                    <Caption1>{shortcut.hint}</Caption1>
                  </div>
                ))}
              </>
            )}

            {showSearch && (
              <>
                <div className={styles.sectionLabel}>
                  {isFetching ? 'Searching...' : `Search results`}
                </div>
                {!isFetching && results.length === 0 && (
                  <div className={styles.empty}>
                    No results for “{debouncedQuery}”.
                  </div>
                )}
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={styles.item}
                    role="button"
                    tabIndex={0}
                    onClick={() => go(result.url)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go(result.url)
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <Body1>{result.title}</Body1>
                    </div>
                    <Badge appearance="tint" size="small">
                      {result.type}
                    </Badge>
                  </div>
                ))}
                {results.length > 0 && (
                  <>
                    <Divider />
                    <div className={styles.sectionLabel}>Quick navigation</div>
                    {NAV_SHORTCUTS.map((shortcut) => (
                      <div
                        key={shortcut.path}
                        className={styles.item}
                        role="button"
                        tabIndex={0}
                        onClick={() => go(shortcut.path)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') go(shortcut.path)
                        }}
                      >
                        <div className={styles.itemLeft}>
                          <Body1>{shortcut.label}</Body1>
                        </div>
                        <Caption1>{shortcut.hint}</Caption1>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

/**
 * Registers a global Cmd/Ctrl+K listener that toggles the palette open.
 * Returns the current open state and a setter. Drop this into a top-level
 * layout component.
 *
 * Spec ref: F2.14.
 */
export function useCommandPaletteShortcut() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen } as const
}

export default CommandPalette
