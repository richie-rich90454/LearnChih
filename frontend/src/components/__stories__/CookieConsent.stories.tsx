import type { Meta, StoryObj } from '@storybook/react-vite'
import CookieConsent from '../CookieConsent'
import useCookieConsentStore from '@/store/cookieConsentStore'

function ResetDecorator({ children }: { children: React.ReactNode }) {
  useCookieConsentStore.getState().reset()
  return <>{children}</>
}

const meta: Meta<typeof CookieConsent> = {
  title: 'Shared/CookieConsent',
  component: CookieConsent,
  decorators: [
    (Story) => (
      <ResetDecorator>
        <Story />
      </ResetDecorator>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CookieConsent>

export const Default: Story = {}
