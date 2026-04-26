import type { ChatMessage, MonitoredGroup } from '../types'

export function slugify(name: string) {
  return 'wx-' + name.replace(/\s+/g, '-').toLowerCase()
}

const WX_AVATAR_COLORS = [
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
  const idx = Math.abs(hash) % WX_AVATAR_COLORS.length
  return WX_AVATAR_COLORS[idx]
}

function formatTime(ts: number) {
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function createWxGroup(name: string): MonitoredGroup {
  return {
    id: slugify(name),
    name,
    emoji: '💬',
    description: '微信实时群监控',
    members: 0,
    unread: 0,
    source: 'wechat',
  }
}

export interface WxRawMessage {
  id?: string | number
  msg_id?: string | number
  timestamp?: number
  time?: string | number
  sender?: string
  username?: string
  content?: string
  msg?: string
  text?: string
  chat?: string
  room?: string
  rich?: {
    type?: string
    emoji_url?: string
    image_url?: string
    thumb_url?: string
    title?: string
    desc?: string
    url?: string
  }
}

export function wxToChatMessages(groupName: string, raw: WxRawMessage[], baseUrl?: string): ChatMessage[] {
  const groupId = slugify(groupName)
  return raw.map((m, i) => {
    const sender = m.sender ?? m.username ?? '未知'
    const ts = m.timestamp ?? (typeof m.time === 'number' ? m.time : 0)

    let content = m.content ?? m.msg ?? m.text ?? ''
    let imageUrl: string | undefined

    const rich = m.rich
    if (rich) {
      if (rich.type === 'emoji' && rich.emoji_url) {
        if (!content) content = '[表情]'
        imageUrl = rich.emoji_url.startsWith('http')
          ? rich.emoji_url
          : `${baseUrl ?? ''}${rich.emoji_url}`
      } else if (rich.type === 'image' && rich.image_url) {
        if (!content) content = '[图片]'
        imageUrl = rich.image_url.startsWith('http')
          ? rich.image_url
          : `${baseUrl ?? ''}${rich.image_url}`
      } else if (rich.type === 'link' || rich.type === 'rich') {
        if (!content) content = `[链接] ${rich.title || rich.desc || ''}`
      } else if (rich.type === 'quote') {
        if (!content) content = '[引用回复]'
      } else if (rich.type === 'file') {
        if (!content) content = `[文件] ${rich.title || ''}`
      } else if (rich.type === 'video') {
        if (!content) content = '[视频]'
      } else if (!content) {
        content = `[${rich.type || '富媒体'}]`
      }
    }

    return {
      id: String(m.id ?? m.msg_id ?? `${groupId}-${ts}-${i}`),
      groupId,
      time: ts ? formatTime(ts) : '--:--:--',
      username: sender,
      avatarColor: avatarColorFor(sender),
      content,
      imageUrl,
      source: 'wechat',
    }
  })
}
