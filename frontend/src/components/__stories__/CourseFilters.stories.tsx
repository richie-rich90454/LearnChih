import type { Meta, StoryObj } from '@storybook/react-vite'
import { CourseFilters } from '../CourseFilters'

const meta: Meta<typeof CourseFilters> = {
  title: 'Courses/CourseFilters',
  component: CourseFilters,
  argTypes: {
    onChange: { action: 'changed' },
    onReset: { action: 'reset' },
  },
}

export default meta
type Story = StoryObj<typeof CourseFilters>

export const Default: Story = {
  args: {
    subjects: ['All', 'Mathematics', 'Computer Science', 'Physics'],
    levels: ['All', 'Beginner', 'Intermediate', 'Advanced'],
    initialValue: { query: '', subject: 'All', level: 'All' },
  },
}

export const PreFilled: Story = {
  args: {
    subjects: ['All', 'Mathematics', 'Computer Science', 'Physics'],
    levels: ['All', 'Beginner', 'Intermediate', 'Advanced'],
    initialValue: { query: 'react', subject: 'Computer Science', level: 'Beginner' },
  },
}
