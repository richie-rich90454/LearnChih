import { useState, useRef, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
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
import { useVerifyEmail } from '../hooks/useAuth'
import { resendVerification } from '../api/auth'

const useStyles = makeStyles({
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  verifyCard: {
    width: '100%',
    maxWidth: '420px',
  },
  cardBody: {
    padding: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  codeInputs: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    justifyContent: 'center',
  },
  codeInput: {
    width: '48px',
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
  },
  resendRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
  },
})

export default function VerifyEmailPage() {
  const styles = useStyles()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const verifyMutation = useVerifyEmail()
  const [resendStatus, setResendStatus] = useState<string>('')

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only digits
    const newCode = [...code]
    newCode[index] = value.slice(-1) // Keep only last digit
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) return
    verifyMutation.mutate({ email, code: fullCode })
  }

  const handleResend = async () => {
    try {
      await resendVerification(email)
      setResendStatus('sent')
    } catch {
      setResendStatus('error')
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.verifyCard}>
        <div className={styles.cardBody}>
          <Title3>Verify your email</Title3>
          <p style={{ margin: 0, color: 'var(--colorNeutralForeground2)' }}>
            We sent a 6-digit code to <strong>{email || 'your email'}</strong>
          </p>

          {verifyMutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>
                <MessageBarTitle>Verification failed</MessageBarTitle>
                {(verifyMutation.error as any)?.response?.data?.message || 'Invalid or expired code'}
              </MessageBarBody>
            </MessageBar>
          )}

          {resendStatus === 'sent' && (
            <MessageBar intent="success">
              <MessageBarBody>A new code has been sent to your email.</MessageBarBody>
            </MessageBar>
          )}

          {resendStatus === 'error' && (
            <MessageBar intent="error">
              <MessageBarBody>Failed to resend code. Please try again.</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.codeInputs} onPaste={handlePaste}>
              {code.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  className={styles.codeInput}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e)}
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            <Button
              type="submit"
              appearance="primary"
              className={styles.submitButton}
              disabled={verifyMutation.isPending || code.join('').length !== 6}
            >
              {verifyMutation.isPending ? <Spinner size="tiny" /> : 'Verify Email'}
            </Button>
          </form>

          <div className={styles.resendRow}>
            <span style={{ fontSize: 'var(--fontSizeBase300)' }}>Didn&apos;t receive the code?</span>
            <Button appearance="transparent" size="small" onClick={handleResend}>
              Resend
            </Button>
          </div>

          <div className={styles.resendRow}>
            <Link to="/login" style={{ fontSize: 'var(--fontSizeBase300)' }}>Back to Sign In</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
