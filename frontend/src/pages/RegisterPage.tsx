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
import { useRegister } from '../hooks/useAuth'

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
  },
})

export default function RegisterPage() {
  const styles = useStyles()
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
      setValidationError('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    registerMutation.mutate({ email, password, name })
  }

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.registerCard}>
        <div className={styles.cardBody}>
          <Title3>Create your account</Title3>

          {validationError && (
            <MessageBar intent="error">
              <MessageBarBody>{validationError}</MessageBarBody>
            </MessageBar>
          )}

          {registerMutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>
                <MessageBarTitle>Registration failed</MessageBarTitle>
                {(registerMutation.error as any)?.response?.data?.message || 'Something went wrong'}
              </MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <Label htmlFor="name" required>Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="email" required>Email</Label>
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
              <Label htmlFor="password" required>Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              appearance="primary"
              className={styles.submitButton}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <Spinner size="tiny" /> : 'Create Account'}
            </Button>
          </form>

          <div className={styles.linkRow}>
            <span style={{ fontSize: 'var(--fontSizeBase300)' }}>Already have an account?</span>
            <Link to="/login" style={{ fontSize: 'var(--fontSizeBase300)' }}>Sign In</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
