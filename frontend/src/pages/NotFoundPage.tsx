import { Link } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title1,
  Title3,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components'
import { ArrowLeft24Regular, Search24Regular } from '@fluentui/react-icons'
import Seo from '../components/Seo'

const useStyles = makeStyles({
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: tokens.spacingHorizontalXL,
    textAlign: 'center',
  },
  code: {
    fontSize: '64px',
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
    lineHeight: 1,
    marginBottom: tokens.spacingVerticalS,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    marginTop: tokens.spacingVerticalL,
  },
})

export default function NotFoundPage() {
  const styles = useStyles()

  return (
    <div className={styles.pageContainer}>
      <Seo title="Page not found — LernChih" canonicalPath="/404" robots="noindex, follow" />
      <Card className={styles.card}>
        <div className={styles.code}>404</div>
        <Title1 as="h1">Page not found</Title1>
        <Body1 style={{ marginTop: '8px', display: 'block', color: 'var(--colorNeutralForeground2)' }}>
          Sorry, we couldn&apos;t find the page you were looking for. It may have been moved or no longer exists.
        </Body1>
        <div className={styles.actions}>
          <Link to="/">
            <Button appearance="primary" icon={<ArrowLeft24Regular />}>Back to Dashboard</Button>
          </Link>
          <Link to="/resources">
            <Button appearance="outline" icon={<Search24Regular />}>Search resources</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
