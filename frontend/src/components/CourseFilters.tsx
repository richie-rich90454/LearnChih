import { useState } from 'react'
import {
  Button,
  Dropdown,
  Input,
  Option,
  makeStyles,
  tokens,
} from '@fluentui/react-components'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    alignItems: 'flex-end',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    minWidth: '180px',
  },
})

export interface CourseFiltersValue {
  query: string
  subject: string
  level: string
}

export interface CourseFiltersProps {
  subjects?: string[]
  levels?: string[]
  initialValue?: Partial<CourseFiltersValue>
  onChange?: (value: CourseFiltersValue) => void
  onReset?: () => void
}

export function CourseFilters({
  subjects = ['All'],
  levels = ['All'],
  initialValue = {},
  onChange,
  onReset,
}: CourseFiltersProps) {
  const styles = useStyles()
  const [query, setQuery] = useState(initialValue.query ?? '')
  const [subject, setSubject] = useState(initialValue.subject ?? subjects[0])
  const [level, setLevel] = useState(initialValue.level ?? levels[0])

  const emit = (q: string, s: string, l: string) => {
    onChange?.({ query: q, subject: s, level: l })
  }

  const reset = () => {
    setQuery('')
    setSubject(subjects[0])
    setLevel(levels[0])
    onReset?.()
  }

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <label htmlFor="course-search">Search</label>
        <Input
          id="course-search"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => {
            const value = e.target.value
            setQuery(value)
            emit(value, subject, level)
          }}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="course-subject">Subject</label>
        <Dropdown
          id="course-subject"
          value={subject}
          selectedOptions={[subject]}
          onOptionSelect={(_, data) => {
            const value = data.optionValue ?? subjects[0]
            setSubject(value)
            emit(query, value, level)
          }}
        >
          {subjects.map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Dropdown>
      </div>

      <div className={styles.field}>
        <label htmlFor="course-level">Level</label>
        <Dropdown
          id="course-level"
          value={level}
          selectedOptions={[level]}
          onOptionSelect={(_, data) => {
            const value = data.optionValue ?? levels[0]
            setLevel(value)
            emit(query, subject, value)
          }}
        >
          {levels.map((l) => (
            <Option key={l} value={l}>
              {l}
            </Option>
          ))}
        </Dropdown>
      </div>

      <Button appearance="subtle" onClick={reset}>
        Reset
      </Button>
    </div>
  )
}
