import { useEffect, useState } from 'react'

interface PendingWrite {
  url: string
  method: string
  body: unknown
  timestamp: number
}

const QUEUE_KEY = 'lernchih-pending-writes'

export function useBackgroundSync() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    function updateOnline() {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        flushQueue()
      }
    }
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    // Check pending on mount
    updatePendingCount()
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
  }, [])

  function updatePendingCount() {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
      setPendingCount(queue.length)
    } catch {
      setPendingCount(0)
    }
  }

  function queueWrite(url: string, method: string, body: unknown) {
    const queue: PendingWrite[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    queue.push({ url, method, body, timestamp: Date.now() })
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    updatePendingCount()
  }

  async function flushQueue() {
    const queue: PendingWrite[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    if (queue.length === 0) return
    const failed: PendingWrite[] = []
    for (const write of queue) {
      try {
        const response = await fetch(write.url, {
          method: write.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(write.body),
          credentials: 'include',
        })
        if (!response.ok) failed.push(write)
      } catch {
        failed.push(write)
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed))
    updatePendingCount()
  }

  return { pendingCount, isOnline, queueWrite, flushQueue }
}
