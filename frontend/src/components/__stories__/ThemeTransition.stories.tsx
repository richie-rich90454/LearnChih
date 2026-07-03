import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '@fluentui/react-components'
import { ThemeTransition } from '../ThemeTransition'

const meta: Meta<typeof ThemeTransition> = {
  title: 'Shared/ThemeTransition',
  component: ThemeTransition,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ThemeTransition>

export const Toggle: Story = {
  render: () => {
    const [mode, setMode] = useState<'light' | 'dark'>('light')
    return (
      <div style={{ padding: 24 }}>
        <Button
          appearance="primary"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
        >
          Toggle theme ({mode})
        </Button>
        <ThemeTransition mode={mode} />
      </div>
    )
  },
}

export const FromOrigin: Story = {
  render: () => {
    const [mode, setMode] = useState<'light' | 'dark'>('light')
    return (
      <div style={{ padding: 24 }}>
        <Button
          appearance="primary"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
        >
          Toggle from top-left
        </Button>
        <ThemeTransition mode={mode} originX={0} originY={0} />
      </div>
    )
  },
}
