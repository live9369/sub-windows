import * as React from 'react'
import { createWxGroup } from '@/lib/wechatAdapter'
import type { ChatMessage, MonitoredGroup } from '@/types'

type WechatStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface UseWechatMessagesOptions {
  enabled: boolean
  baseUrl: string
  pollIntervalMs: number
  pythonPath?: string
  scriptPath?: string
}

export function useWechatMessages(options: UseWechatMessagesOptions) {
  const { enabled, baseUrl, pollIntervalMs, pythonPath, scriptPath } = options

  const [discoveredGroups, setDiscoveredGroups] = React.useState<MonitoredGroup[]>([])
  const [messagesByGroup, setMessagesByGroup] = React.useState<Record<string, ChatMessage[]>>({})
  const [status, setStatus] = React.useState<WechatStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const start = React.useCallback(async () => {
    setStatus('connecting')
    setError(null)
    try {
      await window.cssApi!.wechatStart({
        baseUrl,
        pollIntervalMs,
        spawn: pythonPath && scriptPath ? { pythonPath, scriptPath } : undefined,
      })
      setStatus('connected')
      // Discover groups after successful connection
      try {
        const names = (await window.cssApi!.wechatDiscover(baseUrl)) as string[]
        setDiscoveredGroups(names.map((name) => createWxGroup(name)))
      } catch (discoverErr: any) {
        console.warn('[wechat] discover failed:', discoverErr)
      }
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [baseUrl, pollIntervalMs, pythonPath, scriptPath])

  const stop = React.useCallback(() => {
    window.cssApi!.wechatStop()
    setStatus('idle')
    setError(null)
    setDiscoveredGroups([])
  }, [])

  const retry = React.useCallback(() => {
    stop()
    void start()
  }, [start, stop])

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

  // Subscribe to IPC messages from main
  React.useEffect(() => {
    if (!enabled) return
    const unsub = window.cssApi!.onWechatMessage((batch) => {
      const { groupId, groupName, messages } = batch as {
        groupId: string
        groupName: string
        messages: ChatMessage[]
      }
      setDiscoveredGroups((prev) => {
        if (prev.some((g) => g.id === groupId)) return prev
        return [...prev, createWxGroup(groupName)]
      })
      setMessagesByGroup((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] ?? []), ...messages],
      }))
    })
    const unsubStatus = window.cssApi!.onWechatStatusChange((s) => {
      const map: Record<string, WechatStatus> = {
        idle: 'idle',
        starting: 'connecting',
        running: 'connected',
        error: 'error',
      }
      setStatus(map[s.state] ?? (s.state as WechatStatus))
      if (s.error) setError(s.error)
    })
    return () => {
      unsub()
      unsubStatus()
    }
  }, [enabled])

  // Initial status query on mount
  React.useEffect(() => {
    if (!enabled) return
    window.cssApi!.wechatStatus().then((s: any) => {
      if (s?.state) {
        const map: Record<string, WechatStatus> = {
          idle: 'idle',
          starting: 'connecting',
          running: 'connected',
          error: 'error',
        }
        setStatus(map[s.state] ?? (s.state as WechatStatus))
      }
      if (s?.error) setError(s.error)
    }).catch(() => {})
  }, [enabled])

  const refreshGroups = React.useCallback(async () => {
    try {
      const names = (await window.cssApi!.wechatDiscover(baseUrl)) as string[]
      setDiscoveredGroups((prev) => {
        const existing = new Set(prev.map((g) => g.id))
        const added = names
          .map((name) => createWxGroup(name))
          .filter((g) => !existing.has(g.id))
        return [...prev, ...added]
      })
    } catch (err: any) {
      console.warn('[wechat] refreshGroups failed:', err)
    }
  }, [baseUrl])

  return {
    discoveredGroups,
    messagesByGroup,
    status,
    error,
    retry,
    start,
    stop,
    refreshGroups,
  }
}
