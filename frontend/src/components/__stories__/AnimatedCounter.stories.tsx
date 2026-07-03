import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '@fluentui/react-components'
import { AnimatedCounter } from '../AnimatedCounter'

const meta: Meta<typeof AnimatedCounter> = {
  title: 'Shared/AnimatedCounter',
  component: AnimatedCounter,
  argTypes: {
    value: { control: 'number' },
    duration: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof AnimatedCounter>

export const Default: Story = {
  args: {
    value: 1234,
  },
}

export const WithPrefixAndSuffix: Story = {
  args: {
    value: 42_500,
    prefix: '$',
    suffix: ' pts',
  },
}

export const Formatter: Story = {
  args: {
    value: 9876543,
    formatter: (v) => `${Math.round(v).toLocaleString()} learners`,
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(100)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <AnimatedCounter value={value} prefix="Count: " />
        <Button onClick={() => setValue((v) => v + 250)}>Add 250</Button>
        <Button onClick={() => setValue((v) => Math.max(0, v - 100))}>Subtract 100</Button>
      </div>
    )
  },
}
