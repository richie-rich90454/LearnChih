import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Card,
  Input,
  Button,
  Label,
  Title3,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../hooks/useAuth'
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
  registerCard: {
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

export default function RegisterPage() {
  const styles = useStyles()
  const { t } = useTranslation()
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const registerMutation = useRegister()

  const [validationError, setValidationError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!name || !email || !password || !confirmPassword) {
      setValidationError(t('auth.allFieldsRequired'))
      return
    }
    if (password !== confirmPassword) {
      setValidationError(t('auth.passwordsDoNotMatch'))
      return
    }
    if (password.length < 6) {
      setValidationError(t('auth.passwordMinLength'))
      return
    }

    registerMutation.mutate({ email, password, name })
  }

  return (
    <main className={styles.pageContainer}>
      <Seo title={t('auth.registerTitle')} canonicalPath="/register" robots="noindex, follow" />
      <Card className={styles.registerCard}>
        <div className={styles.cardBody}>
          <Title3 as="h1">{t('auth.registerTitle')}</Title3>

          {validationError && (
            <MessageBar intent="error" role="alert">
              <MessageBarBody>{validationError}</MessageBarBody>
            </MessageBar>
          )}

          {registerMutation.isError && (
            <MessageBar intent="error" role="alert">
              <MessageBarBody>
                <MessageBarTitle>{t('auth.registrationFailed')}</MessageBarTitle>
                {(registerMutation.error as any)?.response?.data?.message || t('errors.generic')}
              </MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <Label htmlFor="name" required>{t('auth.username')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={t('auth.namePlaceholder')}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="email" required>{t('auth.email')}</Label>
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
              <Label htmlFor="password" required>{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="confirmPassword" required>{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                required
              />
            </div>

            <Button
              type="submit"
              appearance="primary"
              className={styles.submitButton}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <Spinner size="tiny" /> : t('auth.registerButton')}
            </Button>
          </form>

          <OAuthButtons />

          <div className={styles.linkRow}>
            <span style={{ fontSize: 'var(--fontSizeBase300)' }}>{t('auth.alreadyHaveAccount')}</span>
            <Link to="/login" className={styles.link} style={{ fontSize: 'var(--fontSizeBase300)' }}>
              {t('auth.signInButton')}
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}
