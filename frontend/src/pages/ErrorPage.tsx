import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Button,
  Card,
} from '@fluentui/react-components'
import { ArrowCounterclockwise24Regular } from '@fluentui/react-icons'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <main className={styles.pageContainer}>
      <Seo title={t('errorPage.title')} canonicalPath="/error" robots="noindex, nofollow" />
      <Card className={styles.card}>
        <Title1 as="h1">{t('errorPage.title')}</Title1>
        <Body1 style={{ marginTop: '8px', display: 'block', color: 'var(--colorNeutralForeground2)' }}>
          {t('errorPage.message')}
        </Body1>
        <div className={styles.actions}>
          <Button appearance="primary" icon={<ArrowCounterclockwise24Regular />} onClick={handleRetry}>
            {t('errorPage.retry')}
          </Button>
        </div>
      </Card>
    </main>
  )
}
