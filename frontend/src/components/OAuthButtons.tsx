import { makeStyles, tokens, Button, Text } from '@fluentui/react-components'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    '&::before, &::after': {
      content: '""',
      flex: 1,
      height: '1px',
      backgroundColor: tokens.colorNeutralStroke2,
    },
  },
  button: {
    width: '100%',
  },
})

function getOAuthUrl(provider: 'google' | 'github'): string {
  return `${window.location.origin}/oauth2/authorization/${provider}`
}

export default function OAuthButtons() {
  const styles = useStyles()

  return (
    <div className={styles.container}>
      <div className={styles.divider}>
        <Text size={200}>or</Text>
      </div>
      <Button
        as="a"
        href={getOAuthUrl('google')}
        appearance="outline"
        className={styles.button}
      >
        Continue with Google
      </Button>
      <Button
        as="a"
        href={getOAuthUrl('github')}
        appearance="outline"
        className={styles.button}
      >
        Continue with GitHub
      </Button>
    </div>
  )
}
