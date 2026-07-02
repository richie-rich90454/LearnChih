import { useNavigate } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Body1,
  Card,
  Button,
  Badge,
} from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import { useBookmarkStore } from '../store/bookmarkStore'
import Seo from '../components/Seo'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '800px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  card: {
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    cursor: 'pointer',
  },
  empty: {
    color: tokens.colorNeutralForeground3,
  },
})

export default function BookmarksPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark)

  const items = Object.values(bookmarks).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )

  return (
    <div className={styles.container}>
      <Seo
        title="Bookmarks — LernChih"
        description="Your saved learning resources on LernChih."
        canonicalPath="/bookmarks"
      />
      <Title2 as="h1">Bookmarks</Title2>
      {items.length === 0 && (
        <Body1 className={styles.empty}>
          No bookmarks yet. Save resources from the resource cards or detail page.
        </Body1>
      )}
      <div className={styles.list}>
        {items.map((item) => (
          <Card
            key={item.resourceId}
            className={styles.card}
            onClick={() => navigate(`/resources/${item.resourceId}`)}
          >
            <div>
              <Body1>{item.title}</Body1>
              <Badge appearance="outline" size="small" style={{ marginTop: '4px' }}>
                Resource #{item.resourceId}
              </Badge>
            </div>
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={(e) => {
                e.stopPropagation()
                removeBookmark(item.resourceId)
              }}
              aria-label="Remove bookmark"
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
