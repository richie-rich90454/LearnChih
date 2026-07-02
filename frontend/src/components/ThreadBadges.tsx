import { Badge, makeStyles, tokens } from '@fluentui/react-components'
import { Pin24Regular, LockClosed24Regular, QuestionCircle24Regular } from '@fluentui/react-icons'

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
  const styles = useStyles()
  return (
    <div className={styles.root}>
      {status.pinned && (
        <Badge appearance="filled" color="brand" icon={<Pin24Regular />}>
          Pinned
        </Badge>
      )}
      {status.locked && (
        <Badge appearance="filled" color="severe" icon={<LockClosed24Regular />}>
          Locked
        </Badge>
      )}
      {status.qaMode && (
        <Badge appearance="filled" color="success" icon={<QuestionCircle24Regular />}>
          Q&A
        </Badge>
      )}
    </div>
  )
}

export default ThreadBadges
