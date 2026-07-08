import * as React from 'react'
import type { ChatMessage, MonitoredGroup } from '@/types'
import type { TelegramBatch, TelegramDialog } from '@/types/cssApi'

type TgStatus = 'idle' | 'connecting' | 'waiting_code' | 'waiting_password' | 'connected' | 'error'

export interface UseTelegramMessagesOptions {
  enabled: boolean
  apiId: number
  apiHash: string
  phone: string
}

function mapDialogsToGroups(dialogs: TelegramDialog[]): MonitoredGroup[] {
  return dialogs.map((d) => ({
    id: `tg-${d.id}`,
    name: d.name,
    emoji: d.type === 'channel' ? '📢' : d.type === 'group' ? '👥' : '👤',
    description: `${d.type} · unread ${d.unreadCount}`,
    members: 0,
    unread: d.unreadCount || 0,
    source: 'telegram' as const,
  }))
}

export function useTelegramMessages(options: UseTelegramMessagesOptions) {
  const { enabled, apiId, apiHash, phone } = options

  const [discoveredGroups, setDiscoveredGroups] = React.useState<MonitoredGroup[]>([])
  const [messagesByGroup, setMessagesByGroup] = React.useState<Record<string, ChatMessage[]>>({})
  const [status, setStatus] = React.useState<TgStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [needCode, setNeedCode] = React.useState(false)
  const [needPassword, setNeedPassword] = React.useState(false)

  const connect = React.useCallback(async () => {
    if (!apiId || !apiHash) {
      setError('请先配置 API ID 和 API Hash')
      setStatus('error')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      const state = await window.cssApi!.telegramConnect(apiId, apiHash)
      setStatus(state.state as TgStatus)
      if (state.state === 'connected') {
        // Load dialogs after connection
        const dialogs = await window.cssApi!.telegramGetDialogs()
        setDiscoveredGroups(mapDialogsToGroups(dialogs))
      } else if (state.state === 'idle' && state.error) {
        setError(state.error)
        setStatus('error')
      }
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [apiId, apiHash])

  const login = React.useCallback(async () => {
    if (!phone) {
      setError('请输入手机号')
      setStatus('error')
      return
    }
    try {
      const state = await window.cssApi!.telegramLogin(phone)
      setStatus(state.state as TgStatus)
      if (state.error) setError(state.error)
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [phone])

  const submitCode = React.useCallback(async (code: string) => {
    try {
      const state = await window.cssApi!.telegramSubmitCode(code)
      setStatus(state.state as TgStatus)
      if (state.error) setError(state.error)
      setNeedCode(false)
      if (state.state === 'connected') {
        const dialogs = await window.cssApi!.telegramGetDialogs()
        setDiscoveredGroups(mapDialogsToGroups(dialogs))
      }
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [])

  const submitPassword = React.useCallback(async (password: string) => {
    try {
      const state = await window.cssApi!.telegramSubmitPassword(password)
      setStatus(state.state as TgStatus)
      if (state.error) setError(state.error)
      setNeedPassword(false)
      if (state.state === 'connected') {
        const dialogs = await window.cssApi!.telegramGetDialogs()
        setDiscoveredGroups(mapDialogsToGroups(dialogs))
      }
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(msg)
      setStatus('error')
    }
  }, [])

  const disconnect = React.useCallback(async () => {
    await window.cssApi!.telegramDisconnect()
    setStatus('idle')
    setError(null)
    setNeedCode(false)
    setNeedPassword(false)
    setDiscoveredGroups([])
  }, [])

  // Auto connect when enabled and credentials are set
  React.useEffect(() => {
    if (!enabled) {
      disconnect()
      return
    }
    if (apiId && apiHash) {
      void connect()
    }
  }, [enabled, apiId, apiHash])

  // Subscribe to IPC messages from main
  React.useEffect(() => {
    if (!enabled) return
    const unsubMsg = window.cssApi!.onTelegramMessage((batch: TelegramBatch) => {
      const { groupId, groupName, messages } = batch
      setDiscoveredGroups((prev) => {
        if (prev.some((g) => g.id === groupId)) return prev
        return [
          ...prev,
          {
            id: groupId,
            name: groupName,
            emoji: '👤',
            description: 'telegram',
            members: 0,
            unread: 0,
            source: 'telegram' as const,
          },
        ]
      })
      setMessagesByGroup((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] ?? []), ...messages],
      }))
    })
    const unsubStatus = window.cssApi!.onTelegramStatusChange((s) => {
      setStatus(s.state as TgStatus)
      if (s.error) setError(s.error)
    })
    const unsubNeedCode = window.cssApi!.onTelegramNeedCode(() => {
      setNeedCode(true)
      setStatus('waiting_code')
    })
    const unsubNeedPassword = window.cssApi!.onTelegramNeedPassword(() => {
      setNeedPassword(true)
      setStatus('waiting_password')
    })
    return () => {
      unsubMsg()
      unsubStatus()
      unsubNeedCode()
      unsubNeedPassword()
    }
  }, [enabled])

  // Initial status query on mount
  React.useEffect(() => {
    if (!enabled) return
    window.cssApi!.telegramStatus().then((s) => {
      if (s?.state) setStatus(s.state as TgStatus)
      if (s?.error) setError(s.error)
    }).catch(() => {})
  }, [enabled])

  const loadHistory = React.useCallback(async (chatId: string, limit = 50) => {
    try {
      const msgs = await window.cssApi!.telegramLoadHistory(chatId.replace(/^tg-/, ''), limit)
      setMessagesByGroup((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), ...msgs],
      }))
      return msgs
    } catch (err: any) {
      console.warn('[telegram] loadHistory failed:', err)
      return []
    }
  }, [])

  return {
    discoveredGroups,
    messagesByGroup,
    status,
    error,
    needCode,
    needPassword,
    connect,
    login,
    submitCode,
    submitPassword,
    disconnect,
    loadHistory,
  }
}
