import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ErrorBoundary } from '../ErrorBoundary'
import { Button } from '@fluentui/react-components'

function BuggyButton() {
  const [shouldThrow, setShouldThrow] = useState(false)
  if (shouldThrow) {
    throw new Error('Simulated error from story component')
  }
  return (
    <Button onClick={() => setShouldThrow(true)}>
      Trigger error
    </Button>
  )
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Shared/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ErrorBoundary>

export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyButton />
    </ErrorBoundary>
  ),
}

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div
          role="alert"
          style={{
            padding: 24,
            border: '2px solid var(--colorPaletteRedBorder1)',
            borderRadius: 8,
            background: 'var(--colorPaletteRedBackground1)',
          }}
        >
          <h3>Custom error fallback</h3>
          <p>Something unexpected happened in this component tree.</p>
        </div>
      }
    >
      <BuggyButton />
    </ErrorBoundary>
  ),
}

export const HealthyChildren: Story = {
  render: () => (
    <ErrorBoundary>
      <div style={{ padding: 16, border: '1px dashed' }}>
        <p>This content renders normally.</p>
      </div>
    </ErrorBoundary>
  ),
}
