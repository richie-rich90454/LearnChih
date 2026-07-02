import { makeStyles, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  root: {
    lineHeight: '1.6',
    color: tokens.colorNeutralForeground1,
    '& img': { maxWidth: '100%', height: 'auto', borderRadius: tokens.borderRadiusMedium },
    '& a': { color: tokens.colorBrandForegroundLink },
    '& pre': {
      padding: tokens.spacingHorizontalM,
      background: tokens.colorNeutralBackground2,
      borderRadius: tokens.borderRadiusMedium,
      overflowX: 'auto',
    },
    '& code': {
      fontFamily: 'monospace',
      fontSize: 'var(--fontSizeBase200)',
    },
    '& blockquote': {
      marginInlineStart: 0,
      paddingInlineStart: tokens.spacingHorizontalM,
      borderInlineStartWidth: '3px',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.colorBrandStroke1,
      color: tokens.colorNeutralForeground3,
    },
  },
})

interface RichContentRendererProps {
  /** Sanitized HTML returned by the server. */
  html: string
  className?: string
}

/**
 * Renders rich content that the server has already sanitized via OWASP
 * HtmlSanitizer. Because the server is the trust boundary, we render the
 * HTML directly here.
 *
 * Spec refs: F1.7.
 */
export function RichContentRenderer({ html, className }: RichContentRendererProps) {
  const styles = useStyles()
  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default RichContentRenderer
