import { useState } from 'react'
import {
  makeStyles,
  tokens,
  Card,
  Button,
  Switch,
  Body1,
  Link,
  Subtitle2,
} from '@fluentui/react-components'
import useCookieConsentStore from '../store/cookieConsentStore'

const useStyles = makeStyles({
  banner: {
    position: 'fixed',
    bottom: tokens.spacingVerticalM,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '720px',
    zIndex: 1000,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    '@media (max-width: 768px)': {
      bottom: '0',
      left: '0',
      transform: 'none',
      width: '100%',
      maxWidth: '100%',
      borderRadius: '0',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: 'none',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXXS,
  },
  customizeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  switchRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
  },
  switchLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  switchControl: {
    flexShrink: 0,
    marginTop: tokens.spacingVerticalXXS,
  },
})

export default function CookieConsent() {
  const styles = useStyles()
  const hasResponded = useCookieConsentStore((s) => s.hasResponded)
  const setConsent = useCookieConsentStore((s) => s.setConsent)
  const [customized, setCustomized] = useState(false)
  const [functionalLocal, setFunctionalLocal] = useState(false)
  const [analyticsLocal, setAnalyticsLocal] = useState(false)

  if (hasResponded) {
    return null
  }

  const handleAcceptAll = () => setConsent(true, true)
  const handleRejectAll = () => setConsent(false, false)
  const handleSaveCustomization = () => setConsent(functionalLocal, analyticsLocal)
  const handleToggleCustomize = () => setCustomized((prev) => !prev)

  return (
    <Card
      className={styles.banner}
      role="region"
      aria-label="Cookie consent"
      size="small"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <Subtitle2>Cookie preferences</Subtitle2>
          <Body1>
            We use cookies to keep the site working (necessary), enable extra features
            (functional), and understand how you use the site (analytics). Necessary cookies are
            always on. See our{' '}
            <Link href="#" target="_blank" rel="noreferrer">
              privacy notice
            </Link>
            .
          </Body1>
        </div>

        {customized && (
          <div
            id="cookie-customize"
            className={styles.customizeSection}
            role="group"
            aria-label="Cookie categories"
          >
            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Body1>
                  <strong>Necessary</strong>
                </Body1>
                <Body1>Required for the site to function. Always on.</Body1>
              </div>
              <Switch
                className={styles.switchControl}
                checked
                disabled
                aria-label="Necessary cookies, always on"
              />
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Body1>
                  <strong>Functional</strong>
                </Body1>
                <Body1>Remember your preferences and settings.</Body1>
              </div>
              <Switch
                className={styles.switchControl}
                checked={functionalLocal}
                onChange={(_, data) => setFunctionalLocal(data.checked)}
                aria-label="Functional cookies"
              />
            </div>

            <div className={styles.switchRow}>
              <div className={styles.switchLabel}>
                <Body1>
                  <strong>Analytics</strong>
                </Body1>
                <Body1>Help us improve by measuring usage.</Body1>
              </div>
              <Switch
                className={styles.switchControl}
                checked={analyticsLocal}
                onChange={(_, data) => setAnalyticsLocal(data.checked)}
                aria-label="Analytics cookies"
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button appearance="primary" onClick={handleAcceptAll}>
            Accept all
          </Button>
          <Button appearance="secondary" onClick={handleRejectAll}>
            Reject all
          </Button>
          <Button
            appearance="subtle"
            onClick={handleToggleCustomize}
            aria-expanded={customized}
            aria-controls="cookie-customize"
          >
            {customized ? 'Hide options' : 'Customize'}
          </Button>
          {customized && (
            <Button appearance="primary" onClick={handleSaveCustomization}>
              Save selection
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
