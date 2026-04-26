import * as React from 'react'
import { createWxGroup, wxToChatMessages } from '@/lib/wechatAdapter'
import type { ChatMessage, MonitoredGroup } from '@/types'

type WechatStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface UseWechatMessagesOptions {
  enabled: boolean
  baseUrl: string
  groups: string[]
  pollIntervalMs: number
  pythonPath?: string
  scriptPath?: string
}

export function useWechatMessages(options: UseWechatMessagesOptions) {
  const { enabled, baseUrl, groups, pollIntervalMs, pythonPath, scriptPath } = options

  const wxGroups = React.useMemo<MonitoredGroup[]>(
    () => groups.map((name) => createWxGroup(name)),
    [groups],
  )

  const [messagesByGroup, setMessagesByGroup] = React.useState<Record<string, ChatMessage[]>>({})
  const [status, setStatus] = React.useState<WechatStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const start = React.useCallback(async () => {
    setStatus('connecting')
    setError(null)
    try {
      await window.cssApi!.wechatStart({
        baseUrl,
        groups,
        pollIntervalMs,
        spawn: pythonPath && scriptPath ? { pythonPath, scriptPath } : undefined,
      })
      setStatus('connected')
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [baseUrl, groups, pollIntervalMs, pythonPath, scriptPath])

  const stop = React.useCallback(() => {
    window.cssApi!.wechatStop()
    setStatus('idle')
    setError(null)
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
      const { groupId, messages } = batch as { groupId: string; messages: ChatMessage[] }
      setMessagesByGroup((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] ?? []), ...messages],
      }))
    })
    const unsubStatus = window.cssApi!.onWechatStatusChange((s) => {
      setStatus(s.state as WechatStatus)
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
      if (s?.state) setStatus(s.state)
      if (s?.error) setError(s.error)
    }).catch(() => {})
  }, [enabled])

  return {
    groups: wxGroups,
    messagesByGroup,
    status,
    error,
    retry,
    start,
    stop,
  }
}
