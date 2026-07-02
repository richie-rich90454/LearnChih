import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
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
  Spinner,
} from '@fluentui/react-components'
import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../api/password'
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
})

export default function ResetPasswordPage() {
  const styles = useStyles()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const mutation = useMutation({
    mutationFn: () => resetPassword({ token, newPassword: password }),
    onSuccess: () => {
      navigate('/login')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    mutation.mutate()
  }

  return (
    <div className={styles.pageContainer}>
      <Seo title="Reset password — LernChih" canonicalPath="/reset-password" robots="noindex, follow" />
      <Card className={styles.card}>
        <div className={styles.cardBody}>
          <Title3 as="h1">Create new password</Title3>

          {!token && (
            <MessageBar intent="error">
              <MessageBarBody>Invalid or expired reset link.</MessageBarBody>
            </MessageBar>
          )}

          {validationError && (
            <MessageBar intent="error">
              <MessageBarBody>{validationError}</MessageBarBody>
            </MessageBar>
          )}

          {mutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>Failed to reset password. The link may have expired.</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <Label htmlFor="password" required>New password</Label>
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
              <Label htmlFor="confirmPassword" required>Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>
            <Button type="submit" appearance="primary" disabled={!token || mutation.isPending}>
              {mutation.isPending ? <Spinner size="tiny" /> : 'Reset password'}
            </Button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 'var(--fontSizeBase300)' }}>Back to sign in</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
