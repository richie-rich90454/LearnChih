import { Badge, makeStyles, tokens } from '@fluentui/react-components'
import { Pin24Regular, LockClosed24Regular, QuestionCircle24Regular } from '@fluentui/react-icons'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
})

export interface ThreadStatus {
  pinned?: boolean
  locked?: boolean
  qaMode?: boolean
}

interface ThreadBadgesProps {
  status: ThreadStatus
}

export function ThreadBadges({ status }: ThreadBadgesProps) {
  const { t } = useTranslation()
  const styles = useStyles()
  return (
    <div className={styles.root}>
      {status.pinned && (
        <Badge appearance="filled" color="brand" icon={<Pin24Regular />}>
          {t('thread.pinned')}
        </Badge>
      )}
      {status.locked && (
        <Badge appearance="filled" color="severe" icon={<LockClosed24Regular />}>
          {t('thread.locked')}
        </Badge>
      )}
      {status.qaMode && (
        <Badge appearance="filled" color="success" icon={<QuestionCircle24Regular />}>
          {t('thread.qaMode')}
        </Badge>
      )}
    </div>
  )
}

export default ThreadBadges
