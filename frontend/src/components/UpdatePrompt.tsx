import { useEffect, useState } from 'react'
import { Button, MessageBar, MessageBarActions, MessageBarBody, MessageBarTitle } from '@fluentui/react-components'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url) {
      console.log('SW registered:', url)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  const close = () => setNeedRefresh(false)

  if (!needRefresh) return null

  return (
    <MessageBar intent="info" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <MessageBarBody>
        <MessageBarTitle>Update available</MessageBarTitle>
        A new version of the app is available.
      </MessageBarBody>
      <MessageBarActions>
        <Button appearance="primary" onClick={() => updateServiceWorker(true)}>
          Reload
        </Button>
        <Button onClick={close}>Dismiss</Button>
      </MessageBarActions>
    </MessageBar>
  )
}
