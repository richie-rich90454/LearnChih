import {
  Button,
  makeStyles,
  tokens,
  Body1,
  Caption1,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import api from '../api/axios'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  question: {
    fontWeight: 600,
  },
  optionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  optionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  barTrack: {
    height: '8px',
    width: '100%',
    background: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: tokens.colorBrandBackground,
    transitionProperty: 'width',
    transitionDuration: '200ms',
  },
})

export interface PollOption {
  id: number
  text: string
  voteCount: number
}

export interface Poll {
  id: number
  postId?: number
  question: string
  options: PollOption[]
  totalVotes: number
  votedOptionId?: number
}

interface PollDisplayProps {
  poll: Poll
}

/**
 * Displays a poll with vote buttons and a results bar per option. Once the
 * current user has voted, results are shown and the chosen option is
 * highlighted.
 *
 * Spec ref: F1.12.
 */
export function PollDisplay({ poll }: PollDisplayProps) {
  const styles = useStyles()
  const queryClient = useQueryClient()

  const voteMutation = useMutation({
    mutationFn: (optionId: number): Promise<AxiosResponse<Poll>> =>
      api.post<Poll>(`/polls/${poll.id}/vote`, { optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', poll.id] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })

  const hasVoted = poll.votedOptionId !== undefined
  const total = poll.totalVotes || poll.options.reduce((sum, o) => sum + o.voteCount, 0)

  return (
    <div className={styles.root}>
      <Body1 className={styles.question}>{poll.question}</Body1>

      {voteMutation.isError && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to register your vote.</MessageBarBody>
        </MessageBar>
      )}

      {poll.options.map((option) => {
        const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0
        const chosen = poll.votedOptionId === option.id
        return (
          <div key={option.id} className={styles.optionRow}>
            <div className={styles.optionTop}>
              <Body1>
                {option.text}
                {chosen && ' ✓'}
              </Body1>
              {hasVoted ? (
                <Caption1>{pct}% · {option.voteCount}</Caption1>
              ) : (
                <Button
                  size="small"
                  appearance={chosen ? 'primary' : 'subtle'}
                  disabled={voteMutation.isPending}
                  onClick={() => voteMutation.mutate(option.id)}
                >
                  Vote
                </Button>
              )}
            </div>
            {hasVoted && (
              <div className={styles.barTrack} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        )
      })}

      <Caption1>
        {voteMutation.isPending && <Spinner size="tiny" />}
        {total} {total === 1 ? 'vote' : 'votes'}
      </Caption1>
    </div>
  )
}

export default PollDisplay
