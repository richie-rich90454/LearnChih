import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components'
import { ArrowCounterclockwise24Regular } from '@fluentui/react-icons'
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
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: tokens.spacingVerticalL,
  },
})

export default function ErrorPage() {
  const styles = useStyles()

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className={styles.pageContainer}>
      <Seo title="Something went wrong — LernChih" canonicalPath="/error" robots="noindex, nofollow" />
      <Card className={styles.card}>
        <Title1 as="h1">Something went wrong</Title1>
        <Body1 style={{ marginTop: '8px', display: 'block', color: 'var(--colorNeutralForeground2)' }}>
          An unexpected error occurred while loading this page. Please try again.
        </Body1>
        <div className={styles.actions}>
          <Button appearance="primary" icon={<ArrowCounterclockwise24Regular />} onClick={handleRetry}>
            Try again
          </Button>
        </div>
      </Card>
    </div>
  )
}
