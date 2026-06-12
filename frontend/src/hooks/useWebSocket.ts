import { useEffect, useRef, useCallback } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import type { WebSocketPostMessage, Post } from '../types'

interface SubscriptionEntry {
  destination: string
  callback: (body: WebSocketPostMessage) => void
  stompSubscription?: { unsubscribe: () => void }
}

export default function useWebSocket() {
  const stompClient = useRef<Client | null>(null)
  const subscriptions = useRef<Map<string, SubscriptionEntry>>(new Map())
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)

  const connect = useCallback(() => {
    if (stompClient.current?.active) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        // Re-subscribe to any active topics after reconnect
        subscriptions.current.forEach((sub, key) => {
          const { destination, callback } = sub
          const stompSub = client.subscribe(destination, (message: IMessage) => {
            const body: WebSocketPostMessage = JSON.parse(message.body)
            callback(body)
          })
          subscriptions.current.set(key, { ...sub, stompSubscription: stompSub })
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.message)
      },
    })

    client.activate()
    stompClient.current = client
  }, [token])

  const disconnect = useCallback(() => {
    if (stompClient.current?.active) {
      stompClient.current.deactivate()
    }
    subscriptions.current.clear()
    stompClient.current = null
  }, [])

  // Connect when authenticated, disconnect on logout
  useEffect(() => {
    if (token) {
      connect()
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [token, connect, disconnect])

  const subscribeToThread = useCallback((threadId: string, callback?: (body: WebSocketPostMessage) => void) => {
    const key = `thread-${threadId}`
    const destination = `/topic/thread/${threadId}`

    const wrappedCallback = (body: WebSocketPostMessage) => {
      // Update React Query cache for resource posts
      queryClient.setQueryData<Post[]>(['resourcePosts', String(threadId)], (old) => {
        if (!old) return old
        return [...old, body as unknown as Post]
      })
      callback?.(body)
    }

    if (stompClient.current?.active) {
      const stompSub = stompClient.current.subscribe(destination, (message: IMessage) => {
        const body: WebSocketPostMessage = JSON.parse(message.body)
        wrappedCallback(body)
      })
      subscriptions.current.set(key, { destination, callback: wrappedCallback, stompSubscription: stompSub })
    } else {
      // Store subscription for when client connects
      subscriptions.current.set(key, { destination, callback: wrappedCallback })
    }

    return () => {
      const sub = subscriptions.current.get(key)
      if (sub?.stompSubscription) {
        sub.stompSubscription.unsubscribe()
      }
      subscriptions.current.delete(key)
    }
  }, [queryClient])

  const subscribeToChannelThread = useCallback((threadId: string, callback?: (body: WebSocketPostMessage) => void) => {
    const key = `channel-thread-${threadId}`
    const destination = `/topic/channel-thread/${threadId}`

    const wrappedCallback = (body: WebSocketPostMessage) => {
      // Update React Query cache for channel posts
      queryClient.setQueryData<Post[]>(['channelPosts'], (old) => {
        if (!old) return old
        return [...old, body as unknown as Post]
      })
      callback?.(body)
    }

    if (stompClient.current?.active) {
      const stompSub = stompClient.current.subscribe(destination, (message: IMessage) => {
        const body: WebSocketPostMessage = JSON.parse(message.body)
        wrappedCallback(body)
      })
      subscriptions.current.set(key, { destination, callback: wrappedCallback, stompSubscription: stompSub })
    } else {
      subscriptions.current.set(key, { destination, callback: wrappedCallback })
    }

    return () => {
      const sub = subscriptions.current.get(key)
      if (sub?.stompSubscription) {
        sub.stompSubscription.unsubscribe()
      }
      subscriptions.current.delete(key)
    }
  }, [queryClient])

  return { subscribeToThread, subscribeToChannelThread, disconnect }
}
