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
  Text,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
} from '@fluentui/react-components'
import { useLogin } from '../hooks/useAuth'

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
  },
})

export default function LoginPage() {
  const styles = useStyles()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    loginMutation.mutate({ email, password })
  }

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.loginCard}>
        <div className={styles.cardBody}>
          <Title3>Sign in to OpenSolutions</Title3>

          {loginMutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>
                <MessageBarTitle>Login failed</MessageBarTitle>
                {(loginMutation.error as any)?.response?.data?.message || 'Invalid email or password'}
              </MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              appearance="primary"
              className={styles.submitButton}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Spinner size="tiny" /> : 'Sign In'}
            </Button>
          </form>

          <div className={styles.linkRow}>
            <Text size={300}>Don&apos;t have an account?</Text>
            <Link to="/register" style={{ fontSize: 'var(--fontSizeBase300)' }}>
              Register
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
