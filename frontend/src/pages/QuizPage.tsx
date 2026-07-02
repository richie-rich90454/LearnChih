import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  makeStyles,
  tokens,
  Title2,
  Button,
  Card,
  Text,
  Spinner,
  Dropdown,
  Option,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useQuizzes } from '../hooks/useQuizzes'
import QuizWidget from '../components/QuizWidget'
import Seo from '../components/Seo'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '800px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  quizCard: {
    padding: tokens.spacingHorizontalL,
    cursor: 'pointer',
  },
})

export default function QuizPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { data: quizzes, isLoading } = useQuizzes()
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>()

  const quizOptions = quizzes?.map((q) => ({ value: String(q.id), label: q.title })) || []

  return (
    <div className={styles.container}>
      <Seo title="Quizzes — LernChih" canonicalPath="/quizzes" />
      <div className={styles.headerRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
          Back
        </Button>
        <Title2 as="h1">Quizzes</Title2>
      </div>

      <Dropdown
        placeholder="Select a quiz"
        value={quizOptions.find((q) => q.value === selectedQuizId)?.label || ''}
        selectedOptions={selectedQuizId ? [selectedQuizId] : []}
        onOptionSelect={(_, data) => setSelectedQuizId(data.optionValue)}
        disabled={isLoading}
      >
        {quizOptions.map((q) => (
          <Option key={q.value} value={q.value}>{q.label}</Option>
        ))}
      </Dropdown>

      {isLoading && <Spinner label="Loading quizzes..." />}

      {!isLoading && !selectedQuizId && quizzes?.map((quiz) => (
        <Card
          key={quiz.id}
          className={styles.quizCard}
          onClick={() => setSelectedQuizId(String(quiz.id))}
        >
          <Text weight="semibold">{quiz.title}</Text>
          {quiz.description && (
            <Text style={{ color: 'var(--colorNeutralForeground3)' }}>{quiz.description}</Text>
          )}
          <Text style={{ color: 'var(--colorNeutralForeground3)' }}>
            {quiz.questions.length} questions
          </Text>
        </Card>
      ))}

      {selectedQuizId && <QuizWidget quizId={selectedQuizId} />}
    </div>
  )
}
