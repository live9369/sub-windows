import * as React from 'react'
import type { FeedItem } from '@/types'

type BinanceSquareStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface UseBinanceSquareFeedOptions {
  enabled: boolean
  curlCommand: string
  intervalMs?: number
}

function relativeTime(msOrSec: number): string {
  const ts = msOrSec > 1e12 ? msOrSec : msOrSec * 1000
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function pickFeedArray(json: any): any[] {
  const direct =
    json?.data?.feedData?.list ??
    json?.data?.feedData?.feeds ??
    json?.data?.feedData ??
    json?.data?.list ??
    json?.data?.items
  if (Array.isArray(direct)) return direct

  const queue: any[] = [json?.data]
  while (queue.length) {
    const cur = queue.shift()
    if (!cur || typeof cur !== 'object') continue
    for (const val of Object.values(cur)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') return val
      if (val && typeof val === 'object') queue.push(val)
    }
  }
  return []
}

function toFeedItem(raw: any, idx: number): FeedItem | null {
  const author =
    raw?.publisher?.nickName ||
    raw?.publisher?.nickname ||
    raw?.user?.nickName ||
    raw?.user?.nickname ||
    raw?.author ||
    'Binance Square'
  const text = raw?.content || raw?.text || raw?.title || raw?.desc || ''
  if (!text || typeof text !== 'string') return null
  const id = String(raw?.id || raw?.postId || raw?.feedId || `binance-${idx}`)
  const link =
    raw?.jumpUrl ||
    raw?.shareUrl ||
    raw?.link ||
    raw?.url ||
    'https://www.binance.com/zh-CN/square'
  const ts = Number(raw?.createTime || raw?.publishTime || raw?.timestamp || Date.now())

  return {
    id: `bn-${id}`,
    source: 'binance',
    author,
    handle: raw?.publisher?.userName ? `@${raw.publisher.userName}` : 'binance.com/square',
    avatarColor: 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/40',
    avatarLabel: String(author).slice(0, 2).toUpperCase(),
    verified: Boolean(raw?.publisher?.verified || raw?.publisher?.isVerified),
    time: relativeTime(ts),
    content: text,
    link,
    category: raw?.type || raw?.category || 'SQUARE',
    tags: Array.isArray(raw?.symbols) ? raw.symbols.slice(0, 5) : undefined,
  }
}

export function useBinanceSquareFeed(options: UseBinanceSquareFeedOptions) {
  const { enabled, curlCommand, intervalMs = 30000 } = options
  const [items, setItems] = React.useState<FeedItem[]>([])
  const [status, setStatus] = React.useState<BinanceSquareStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const fetchFeed = React.useCallback(async () => {
    if (!curlCommand.trim()) {
      setStatus('error')
      setError('请先粘贴币安广场 curl 请求')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      const raw = await window.cssApi!.binanceSquareFetch(curlCommand)
      const json = JSON.parse(raw)
      const arr = pickFeedArray(json)
      const parsed = arr
        .map((item, idx) => toFeedItem(item, idx))
        .filter((item): item is FeedItem => Boolean(item))
      setItems(parsed)
      setStatus('connected')
      if (parsed.length === 0) setError('请求成功但未解析到可展示内容')
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || '币安广场请求失败')
    }
  }, [curlCommand])

  React.useEffect(() => {
    if (!enabled) {
      setItems([])
      setStatus('idle')
      setError(null)
      return
    }
    void fetchFeed()
    const timer = window.setInterval(() => {
      void fetchFeed()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [enabled, fetchFeed, intervalMs])

  return { items, status, error, refresh: fetchFeed }
}
