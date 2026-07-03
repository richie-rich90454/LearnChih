import type { Meta, StoryObj } from '@storybook/react-vite'
import { TagBadge, TagList } from '../TagBadge'

const meta: Meta<typeof TagBadge> = {
  title: 'Shared/TagBadge',
  component: TagBadge,
  argTypes: {
    tag: { control: 'object' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof TagBadge>

export const Default: Story = {
  args: {
    tag: { id: 1, name: 'React' },
  },
}

export const WithColor: Story = {
  args: {
    tag: { id: 2, name: 'TypeScript', color: '#3178c6' },
  },
}

export const List: Story = {
  render: () => (
    <TagList
      tags={[
        { id: 1, name: 'React' },
        { id: 2, name: 'TypeScript', color: '#3178c6' },
        { id: 3, name: 'Vite', color: '#646cff' },
        { id: 4, name: 'Fluent UI' },
      ]}
    />
  ),
}

export const EmptyList: Story = {
  render: () => <TagList tags={[]} />,
}
