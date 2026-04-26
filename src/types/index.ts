export type Chain = 'solana' | 'eth' | 'base' | 'bsc'

export interface MonitoredGroup {
  id: string
  name: string
  emoji: string
  description: string
  members: number
  unread: number
  source: 'telegram' | 'wechat'
}

/** @deprecated use MonitoredGroup */
export type TelegramGroup = MonitoredGroup

export interface ChatMessage {
  id: string
  groupId: string
  time: string
  username: string
  avatarColor: string
  content: string
  isPinned?: boolean
  isHot?: boolean
  source?: 'telegram' | 'wechat'
}

export interface ExtractedToken {
  raw: string
  chain: Chain
  start: number
  end: number
}

export interface ExtractedMarketCap {
  raw: string
  value: number
  start: number
  end: number
}

export interface ExtractedSignal {
  raw: string
  start: number
  end: number
}

export interface MessageHighlights {
  tokens: ExtractedToken[]
  marketCaps: ExtractedMarketCap[]
  signals: ExtractedSignal[]
}

export type FeedSource = 'x' | 'binance' | 'news'

export interface FeedItem {
  id: string
  source: FeedSource
  author: string
  handle: string
  avatarColor: string
  avatarLabel: string
  verified?: boolean
  time: string
  content: string
  link: string
  imageHint?: string
  tags?: string[]
  category?: string
}

export interface FilterState {
  minMarketCap: number
  whitelist: string
  blacklist: string
  onlyWithCa: boolean
}

export interface AppSettings {
  telegramBotToken: string
  groupIds: string
  dexscreenerEndpoint: string
  refreshIntervalSec: number
  wechatEnabled: boolean
  wechatBaseUrl: string
  wechatPythonPath: string
  wechatScriptPath: string
  wechatGroups: string
  wechatPollIntervalMs: number
}
