import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    // Remove the PWA plugin so Storybook builds don't try to precache manager assets.
    config.plugins = config.plugins?.filter(
      (plugin) =>
        plugin &&
        typeof plugin === 'object' &&
        'name' in plugin &&
        plugin.name !== 'vite-plugin-pwa',
    )
    return config
  },
}
export default config
