import { useState } from 'react'
import {
  makeStyles,
  tokens,
  Card,
  Input,
  Button,
  Label,
  Title3,
  Text,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import Seo from '../components/Seo'
import OAuthButtons from '../components/OAuthButtons'

const useStyles = makeStyles({
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
  },
  cardBody: {
    padding: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  submitButton: {
    width: '100%',
  },
  linkRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    color: tokens.colorBrandForeground1,
  },
})

export default function LoginPage() {
  const { t } = useTranslation()
  const styles = useStyles()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const loginMutation = useLogin(redirect)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    loginMutation.mutate({ email, password })
  }

  return (
    <main className={styles.pageContainer}>
      <Seo title={t('auth.signInTitle')} canonicalPath="/login" robots="noindex, follow" />
      <Card className={styles.loginCard}>
        <div className={styles.cardBody}>
          <Title3 as="h1">{t('auth.signInTitle')}</Title3>

          {loginMutation.isError && (
            <MessageBar intent="error" role="alert">
              <MessageBarBody>
                <MessageBarTitle>{t('auth.loginFailed')}</MessageBarTitle>
                {(loginMutation.error as any)?.response?.data?.message || t('auth.invalidCredentials')}
              </MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <Label htmlFor="email" required>
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="password" required>
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
              />
            </div>

            <Button
              type="submit"
              appearance="primary"
              className={styles.submitButton}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Spinner size="tiny" /> : t('auth.signInButton')}
            </Button>
          </form>

          <OAuthButtons />

          <div className={styles.linkRow}>
            <Link to="/forgot-password" className={styles.link} style={{ fontSize: 'var(--fontSizeBase300)' }}>
              {t('auth.forgotPassword')}
            </Link>
            <Text size={300}>{t('auth.noAccount')}</Text>
            <Link to="/register" className={styles.link} style={{ fontSize: 'var(--fontSizeBase300)' }}>
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}
