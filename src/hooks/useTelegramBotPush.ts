import * as React from 'react'
import type { ChatMessage, MonitoredGroup } from '@/types'

interface UseTelegramBotPushOptions {
  enabled: boolean
  pushUrl: string
  token?: string
  groupIds: string
}

type PushStatus = 'idle' | 'connecting' | 'connected' | 'error'

type GroupFilter =
  | { kind: 'chat'; chatId: string; threadId?: number }
  | { kind: 'username'; username: string; threadId?: number }
  | { kind: 'keyword'; keyword: string }

const TG_AVATAR_COLORS = [
  'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/40',
  'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-500/40',
  'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500/40',
  'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/40',
  'bg-rose-500/30 text-rose-300 ring-1 ring-rose-500/40',
  'bg-blue-500/30 text-blue-300 ring-1 ring-blue-500/40',
]

function avatarColorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return TG_AVATAR_COLORS[Math.abs(hash) % TG_AVATAR_COLORS.length]
}

function formatTime(sec: number) {
  const d = new Date(sec * 1000)
  return d.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function parseFilters(groupIds: string): GroupFilter[] {
  return groupIds
    .split(/[,\s，]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((token) => {
      const [main, threadRaw] = token.split('#')
      const thread = Number(threadRaw)
      const threadId = Number.isFinite(thread) && thread > 0 ? thread : undefined
      if (main.startsWith('@')) return { kind: 'username', username: main, threadId } as GroupFilter
      if (/^-?\d+$/.test(main)) return { kind: 'chat', chatId: main, threadId } as GroupFilter
      return { kind: 'keyword', keyword: token } as GroupFilter
    })
}

function getThreadId(msg: any): number | undefined {
  const threadId = Number(
    msg?.message_thread_id || msg?.threadId || msg?.topicId || msg?.reply_to_message?.message_thread_id,
  )
  return Number.isFinite(threadId) && threadId > 0 ? threadId : undefined
}

function makeGroupId(chatId: string, threadId?: number) {
  return threadId ? `tg-bot-${chatId}#${threadId}` : `tg-bot-${chatId}`
}

function matchesFilter(chat: any, msg: any, filters: GroupFilter[]) {
  if (filters.length === 0) return true
  const chatId = String(chat?.id ?? msg?.chatId ?? '').toLowerCase()
  const username = (chat?.username ? `@${String(chat.username).toLowerCase()}` : msg?.chatUsername || '').toLowerCase()
  const title = String(chat?.title || msg?.chatTitle || '').toLowerCase()
  const threadId = getThreadId(msg)
  return filters.some((f) => {
    if (f.kind === 'chat') {
      if (f.chatId !== chatId) return false
      return f.threadId === undefined || f.threadId === threadId
    }
    if (f.kind === 'username') {
      if (f.username !== username) return false
      return f.threadId === undefined || f.threadId === threadId
    }
    return title && title.includes(f.keyword)
  })
}

function toGroup(chat: any, msg: any): MonitoredGroup {
  const chatId = String(chat?.id ?? msg?.chatId ?? 'unknown')
  const threadId = getThreadId(msg)
  const type = String(chat?.type ?? msg?.chatType ?? 'group')
  const baseName =
    chat?.title ||
    msg?.chatTitle ||
    [chat?.first_name, chat?.last_name].filter(Boolean).join(' ') ||
    (chat?.username ? `@${chat.username}` : `Chat ${chatId}`)
  const fullName = threadId ? `${baseName} / 子频道 ${threadId}` : baseName
  const emoji = type === 'channel' ? '📢' : type === 'supergroup' || type === 'group' ? '👥' : '👤'
  return {
    id: makeGroupId(chatId, threadId),
    name: fullName,
    emoji,
    description: threadId ? `bot-push · ${type} · topic ${threadId}` : `bot-push · ${type}`,
    members: 0,
    unread: 0,
    source: 'telegram',
  }
}

function toMessage(msg: any, chat: any): ChatMessage {
  const chatId = String(chat?.id ?? msg?.chatId ?? 'unknown')
  const threadId = getThreadId(msg)
  const groupId = makeGroupId(chatId, threadId)
  const sender =
    msg?.from?.username
      ? `@${msg.from.username}`
      : msg?.username ||
        [msg?.from?.first_name, msg?.from?.last_name].filter(Boolean).join(' ') ||
        'telegram-bot'
  const content =
    msg?.text ||
    msg?.caption ||
    msg?.content ||
    msg?.poll?.question ||
    msg?.sticker?.emoji ||
    msg?.dice?.emoji ||
    (msg?.photo ? '[图片]' : msg?.video ? '[视频]' : msg?.document ? '[文件]' : '[消息]')
  return {
    id: `tgbot-${chatId}-${threadId ?? 0}-${msg?.message_id ?? msg?.messageId ?? Date.now()}`,
    groupId,
    time: msg?.date ? formatTime(msg.date) : formatTime(Math.floor(Date.now() / 1000)),
    username: sender,
    avatarColor: avatarColorFor(sender),
    content,
    source: 'telegram',
  }
}

export function useTelegramBotPush(options: UseTelegramBotPushOptions) {
  const { enabled, pushUrl, token, groupIds } = options
  const [discoveredGroups, setDiscoveredGroups] = React.useState<MonitoredGroup[]>([])
  const [messagesByGroup, setMessagesByGroup] = React.useState<Record<string, ChatMessage[]>>({})
  const [status, setStatus] = React.useState<PushStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const consumeMessage = React.useCallback(
    (msg: any, chat: any) => {
      const filters = parseFilters(groupIds)
      if (!matchesFilter(chat, msg, filters)) return
      const group = toGroup(chat, msg)
      const mapped = toMessage(msg, chat)
      setDiscoveredGroups((prev) => {
        if (prev.some((g) => g.id === group.id)) return prev
        return [...prev, group]
      })
      setMessagesByGroup((prev) => {
        const existed = prev[group.id] ?? []
        if (existed.some((m) => m.id === mapped.id)) return prev
        const combined = [...existed, mapped]
        return { ...prev, [group.id]: combined.length > 500 ? combined.slice(-500) : combined }
      })
    },
    [groupIds],
  )

  const consumePayload = React.useCallback(
    (payload: any) => {
      if (!payload) return
      if (Array.isArray(payload)) {
        payload.forEach((p) => consumePayload(p))
        return
      }
      if (payload.type === 'batch' && Array.isArray(payload.items)) {
        payload.items.forEach((p: any) => consumePayload(p))
        return
      }
      const msg = payload.message || payload.channel_post || payload.edited_message || payload.edited_channel_post || payload
      const chat = msg.chat || payload.chat || { id: payload.chatId, title: payload.chatTitle, username: payload.chatUsername, type: payload.chatType }
      if (!chat?.id && !payload.chatId) return
      consumeMessage(msg, chat)
    },
    [consumeMessage],
  )

  React.useEffect(() => {
    if (!enabled || !pushUrl.trim()) {
      setStatus('idle')
      setError(null)
      return
    }

    let cancelled = false
    let ws: WebSocket | null = null
    let es: EventSource | null = null
    let reconnectTimer: number | null = null

    const appendToken = (url: string) => {
      if (!token?.trim()) return url
      const hasQuery = url.includes('?')
      return `${url}${hasQuery ? '&' : '?'}token=${encodeURIComponent(token.trim())}`
    }

    const scheduleReconnect = () => {
      if (cancelled) return
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      reconnectTimer = window.setTimeout(connect, 1200)
    }

    const connect = () => {
      if (cancelled) return
      setStatus('connecting')
      setError(null)
      const url = appendToken(pushUrl.trim())
      if (url.startsWith('ws://') || url.startsWith('wss://')) {
        ws = new WebSocket(url)
        ws.onopen = () => setStatus('connected')
        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data || '{}'))
            consumePayload(payload)
          } catch {
            // Ignore malformed push payload
          }
        }
        ws.onerror = () => {
          setStatus('error')
          setError('Bot 推送流连接失败')
        }
        ws.onclose = () => scheduleReconnect()
        return
      }

      es = new EventSource(url)
      es.onopen = () => setStatus('connected')
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data || '{}')
          consumePayload(payload)
        } catch {
          // Ignore malformed SSE payload
        }
      }
      es.onerror = () => {
        setStatus('error')
        setError('Bot 推送流连接失败')
        if (es) es.close()
        scheduleReconnect()
      }
    }

    connect()
    return () => {
      cancelled = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      if (ws) ws.close()
      if (es) es.close()
    }
  }, [consumePayload, enabled, pushUrl, token])

  return { discoveredGroups, messagesByGroup, status, error }
}
