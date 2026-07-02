import { useState } from 'react'
import {
  makeStyles,
  tokens,
  Card,
  Button,
  Text,
  Title3,
  Subtitle2,
  Caption1,
  Spinner,
  Badge,
} from '@fluentui/react-components'
import { CheckmarkCircle24Regular, DismissCircle24Regular } from '@fluentui/react-icons'
import { useQuiz, useSubmitQuiz, type QuizAnswer } from '../hooks/useQuizzes'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '700px',
    margin: '0 auto',
  },
  questionCard: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  option: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  resultCard: {
    padding: tokens.spacingHorizontalL,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
})

interface QuizWidgetProps {
  quizId: string | number
}

export default function QuizWidget({ quizId }: QuizWidgetProps) {
  const styles = useStyles()
  const { data: quiz, isLoading } = useQuiz(quizId)
  const submitQuiz = useSubmitQuiz(quizId)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  if (isLoading) return <Spinner label="Loading quiz..." />
  if (!quiz || !quiz.questions.length) {
    return (
      <div className={styles.empty}>
        <Title3>No questions found</Title3>
        <Text>This quiz doesn&apos;t have any questions yet.</Text>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const result = submitQuiz.data?.data

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = prev.filter((a) => a.questionId !== currentQuestion.id)
      next.push({ questionId: currentQuestion.id, selectedOptionIndex: optionIndex })
      return next
    })
  }

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      submitQuiz.mutate(answers)
    }
  }

  const selectedAnswer = answers.find((a) => a.questionId === currentQuestion.id)

  if (result) {
    return (
      <Card className={styles.resultCard}>
        <Title3>Quiz complete</Title3>
        <Subtitle2>
          Score: {result.score} / {result.totalQuestions} ({Math.round(result.percentage)}%)
        </Subtitle2>
        <Badge appearance="filled" color={result.passed ? 'success' : 'danger'}>
          {result.passed ? 'Passed' : 'Try again'}
        </Badge>
        <div style={{ marginTop: tokens.spacingVerticalM }}>
          {result.details.map((d) => (
            <div key={d.questionId} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {d.correct ? (
                <CheckmarkCircle24Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
              ) : (
                <DismissCircle24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
              )}
              <Text>Question {d.questionId}</Text>
            </div>
          ))}
        </div>
        <Button
          appearance="primary"
          onClick={() => {
            setAnswers([])
            setCurrentIndex(0)
            submitQuiz.reset()
          }}
          style={{ marginTop: tokens.spacingVerticalM }}
        >
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <div className={styles.container}>
      <Caption1>
        Question {currentIndex + 1} of {quiz.questions.length}
      </Caption1>
      <Card className={styles.questionCard}>
        <Subtitle2>{currentQuestion.question}</Subtitle2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
          {currentQuestion.options.map((option, idx) => (
            <Button
              key={idx}
              appearance={selectedAnswer?.selectedOptionIndex === idx ? 'primary' : 'outline'}
              className={styles.option}
              onClick={() => handleSelect(idx)}
            >
              {option}
            </Button>
          ))}
        </div>
        <Button
          appearance="primary"
          onClick={handleNext}
          disabled={selectedAnswer === undefined || submitQuiz.isPending}
        >
          {submitQuiz.isPending ? <Spinner size="tiny" /> : currentIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}
        </Button>
      </Card>
    </div>
  )
}
