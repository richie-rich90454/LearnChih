import { useState } from 'react'
import {
  makeStyles,
  tokens,
  Button,
  Input,
  Label,
  Text,
  Title3,
  Spinner,
  MessageBar,
  MessageBarBody,
  Card,
} from '@fluentui/react-components'
import { useMutation } from '@tanstack/react-query'
import { setupTwoFactor, verifyTwoFactor, type TwoFactorSetupResponse } from '../api/twoFactor'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    maxWidth: '420px',
  },
  qrCode: {
    width: '200px',
    height: '200px',
    objectFit: 'contain',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  secret: {
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    backgroundColor: tokens.colorNeutralBackground1Hover,
    padding: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusSmall,
  },
  backupCodes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalS,
    fontFamily: 'monospace',
  },
})

export default function TwoFactorSetup() {
  const styles = useStyles()
  const [step, setStep] = useState<'intro' | 'setup' | 'verified'>('intro')
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const setupMutation = useMutation({
    mutationFn: () => setupTwoFactor(),
    onSuccess: (response) => {
      setSetupData(response.data)
      setStep('setup')
      setError('')
    },
    onError: () => setError('Failed to start 2FA setup. Please try again.'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyTwoFactor({ code }),
    onSuccess: () => {
      setStep('verified')
      setError('')
    },
    onError: () => setError('Invalid verification code. Please try again.'),
  })

  if (step === 'intro') {
    return (
      <div className={styles.container}>
        <Title3>Two-factor authentication</Title3>
        <Text>Add an extra layer of security by enabling TOTP-based 2FA.</Text>
        <Button appearance="primary" onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
          {setupMutation.isPending ? <Spinner size="tiny" /> : 'Set up 2FA'}
        </Button>
        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}
      </div>
    )
  }

  if (step === 'verified') {
    return (
      <div className={styles.container}>
        <Title3>2FA enabled</Title3>
        <MessageBar intent="success">
          <MessageBarBody>Two-factor authentication is now active on your account.</MessageBarBody>
        </MessageBar>
      </div>
    )
  }

  return (
    <Card className={styles.container}>
      <Title3>Set up authenticator</Title3>
      <Text>Scan the QR code with your authenticator app, then enter the 6-digit code.</Text>

      {setupData?.qrCodeUrl && (
        <img src={setupData.qrCodeUrl} alt="TOTP QR code" className={styles.qrCode} />
      )}

      <div>
        <Text>Or enter this secret manually:</Text>
        <div className={styles.secret}>{setupData?.secret}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
        <Label htmlFor="totp-code">6-digit code</Label>
        <Input
          id="totp-code"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
        />
      </div>

      <Button appearance="primary" onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending || code.length < 6}>
        {verifyMutation.isPending ? <Spinner size="tiny" /> : 'Verify'}
      </Button>

      {setupData?.backupCodes && (
        <div>
          <Text weight="semibold">Backup codes</Text>
          <Text size={300}>Save these in a secure place.</Text>
          <div className={styles.backupCodes}>
            {setupData.backupCodes.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}
    </Card>
  )
}
