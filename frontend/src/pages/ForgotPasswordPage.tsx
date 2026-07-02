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
  Spinner,
} from '@fluentui/react-components'
import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '../api/password'
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

export default function ForgotPasswordPage() {
  const styles = useStyles()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () => forgotPassword({ email }),
    onSuccess: () => setSubmitted(true),
  })

  return (
    <div className={styles.pageContainer}>
      <Seo title="Forgot password — LernChih" canonicalPath="/forgot-password" robots="noindex, follow" />
      <Card className={styles.card}>
        <div className={styles.cardBody}>
          <Title3 as="h1">Reset your password</Title3>

          {submitted ? (
            <MessageBar intent="success">
              <MessageBarBody>
                If an account exists for {email}, you will receive a reset link shortly.
              </MessageBarBody>
            </MessageBar>
          ) : (
            <>
              {mutation.isError && (
                <MessageBar intent="error">
                  <MessageBarBody>Failed to send reset link. Please try again.</MessageBarBody>
                </MessageBar>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  mutation.mutate()
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
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
                <Button type="submit" appearance="primary" disabled={mutation.isPending}>
                  {mutation.isPending ? <Spinner size="tiny" /> : 'Send reset link'}
                </Button>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 'var(--fontSizeBase300)' }}>Back to sign in</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
