import * as React from 'react'
import type { FeedItem } from '@/types'
import type { TwitterState } from '@/types/cssApi'

export interface UseTwitterStreamOptions {
  enabled: boolean
  wsUrl: string
  token: string
}

export function useTwitterStream(options: UseTwitterStreamOptions) {
  const { enabled, wsUrl, token } = options

  const [items, setItems] = React.useState<FeedItem[]>([])
  const [status, setStatus] = React.useState<TwitterState['state']>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const start = React.useCallback(async () => {
    setStatus('connecting')
    setError(null)
    try {
      await window.cssApi!.twitterStart({ wsUrl, token })
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [wsUrl, token])

  const stop = React.useCallback(() => {
    window.cssApi!.twitterStop()
    setStatus('idle')
    setError(null)
    setItems([])
  }, [])

  // Auto start/stop based on enabled flag
  React.useEffect(() => {
    if (!enabled) {
      stop()
      return
    }
    void start()
    return () => {
      stop()
    }
  }, [enabled, start, stop])

  // Subscribe to IPC events
  React.useEffect(() => {
    if (!enabled) return
    const unsubTweet = window.cssApi!.onTwitterTweet((data) => {
      const item = data as FeedItem
      setItems((prev) => {
        if (prev.some((p) => p.id === item.id)) return prev
        const next = [item, ...prev]
        return next.length > 500 ? next.slice(0, 500) : next
      })
    })
    const unsubStatus = window.cssApi!.onTwitterStatusChange((s) => {
      setStatus(s.state)
      if (s.error) setError(s.error)
    })
    return () => {
      unsubTweet()
      unsubStatus()
    }
  }, [enabled])

  // Initial status query
  React.useEffect(() => {
    if (!enabled) return
    window.cssApi!.twitterStatus().then((s) => {
      if (s?.state) setStatus(s.state)
      if (s?.error) setError(s.error)
    }).catch(() => {})
  }, [enabled])

  return { items, status, error, start, stop }
}
