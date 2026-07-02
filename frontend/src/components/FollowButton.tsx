import { Button } from '@fluentui/react-components'
import { useFollow } from '../hooks/useSocial'

interface FollowButtonProps {
  userId: number
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { data, toggle, isPending, isLoading } = useFollow(userId)

  if (isLoading) {
    return <Button appearance="subtle" disabled>Loading…</Button>
  }

  const following = data?.following ?? false

  return (
    <Button
      appearance={following ? 'outline' : 'primary'}
      onClick={() => toggle()}
      disabled={isPending}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
