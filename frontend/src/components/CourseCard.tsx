import {
  Button,
  Card,
  CardHeader,
  Text,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components'

const useStyles = makeStyles({
  card: {
    maxWidth: '360px',
  },
  meta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalM,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
})

export interface CourseCardProps {
  id: string | number
  title: string
  description: string
  subject: string
  level: string
  imageUrl?: string
  onEnroll?: () => void
}

export function CourseCard({
  title,
  description,
  subject,
  level,
  onEnroll,
}: CourseCardProps) {
  const styles = useStyles()
  return (
    <Card className={styles.card}>
      <CardHeader header={<Text weight="semibold">{title}</Text>} />
      <Text>{description}</Text>
      <div className={styles.meta}>
        <Badge appearance="outline">{subject}</Badge>
        <Badge appearance="filled">{level}</Badge>
      </div>
      <div className={styles.footer}>
        <Button appearance="primary" onClick={onEnroll}>
          Enroll
        </Button>
      </div>
    </Card>
  )
}
