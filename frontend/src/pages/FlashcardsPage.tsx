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
import { useDecks } from '../hooks/useFlashcards'
import FlashcardDeck from '../components/FlashcardDeck'
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
  deckSelector: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
  },
  deckCard: {
    padding: tokens.spacingHorizontalL,
    cursor: 'pointer',
  },
})

export default function FlashcardsPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { data: decks, isLoading } = useDecks()
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>()

  const deckOptions = decks?.map((d) => ({ value: String(d.id), label: d.name })) || []

  return (
    <div className={styles.container}>
      <Seo title="Flashcards — LernChih" canonicalPath="/flashcards" />
      <div className={styles.headerRow}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
          Back
        </Button>
        <Title2 as="h1">Flashcards</Title2>
      </div>

      <div className={styles.deckSelector}>
        <Dropdown
          placeholder="Select a deck"
          value={deckOptions.find((d) => d.value === selectedDeckId)?.label || ''}
          selectedOptions={selectedDeckId ? [selectedDeckId] : []}
          onOptionSelect={(_, data) => setSelectedDeckId(data.optionValue)}
          disabled={isLoading}
        >
          {deckOptions.map((d) => (
            <Option key={d.value} value={d.value}>{d.label}</Option>
          ))}
        </Dropdown>
      </div>

      {isLoading && <Spinner label="Loading decks..." />}

      {!isLoading && !selectedDeckId && decks?.map((deck) => (
        <Card
          key={deck.id}
          className={styles.deckCard}
          onClick={() => setSelectedDeckId(String(deck.id))}
        >
          <Text weight="semibold">{deck.name}</Text>
          <Text style={{ color: 'var(--colorNeutralForeground3)' }}>
            {deck.cardCount} cards · {deck.dueCount ?? 0} due
          </Text>
        </Card>
      ))}

      {selectedDeckId && <FlashcardDeck deckId={selectedDeckId} />}
    </div>
  )
}
