import { makeStyles, tokens, Link, Text } from '@fluentui/react-components'

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    fontSize: tokens.fontSizeBase200,
  },
})

export default function Footer() {
  const styles = useStyles()

  return (
    <footer className={styles.footer}>
      <Text size={200}>Feeds:</Text>
      <Link href="/api/feeds/rss" target="_blank" rel="noopener noreferrer">
        RSS
      </Link>
      <Link href="/api/feeds/atom" target="_blank" rel="noopener noreferrer">
        Atom
      </Link>
      <Link href="/api-docs">API Docs</Link>
    </footer>
  )
}
