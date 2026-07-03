import type { Meta, StoryObj } from '@storybook/react-vite'
import { OptimizedImage } from '../OptimizedImage'
import hero from '@/assets/hero.png'

const meta: Meta<typeof OptimizedImage> = {
  title: 'Shared/OptimizedImage',
  component: OptimizedImage,
  argTypes: {
    priority: { control: 'boolean' },
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof OptimizedImage>

export const Default: Story = {
  args: {
    src: hero,
    alt: 'LernChih hero illustration',
    width: 600,
    height: 400,
  },
}

export const PriorityLcp: Story = {
  args: {
    src: hero,
    alt: 'Hero image loaded eagerly with high fetch priority',
    width: 600,
    height: 400,
    priority: true,
  },
}

export const Responsive: Story = {
  args: {
    src: hero,
    alt: 'Responsive hero image',
    width: 600,
    height: 400,
    srcSet: `${hero} 600w, ${hero} 1200w`,
    sizes: '(max-width: 768px) 100vw, 600px',
  },
}
