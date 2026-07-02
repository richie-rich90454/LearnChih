import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'
import App from './App'
import { useThemeStore } from './hooks/useThemeStore'

function ThemedApp() {
  const mode = useThemeStore((s) => s.mode)
  const theme = mode === 'dark' ? webDarkTheme : webLightTheme
  return (
    <FluentProvider theme={theme}>
      <App />
    </FluentProvider>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

const rootElement = document.getElementById('root') as HTMLElement

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemedApp />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
