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

function parseJsonLoose(raw: string): any {
  try {
    return JSON.parse(raw)
  } catch {
    const first = raw.indexOf('{')
    const last = raw.lastIndexOf('}')
    if (first >= 0 && last > first) {
      return JSON.parse(raw.slice(first, last + 1))
    }
    throw new Error(`返回不是有效 JSON：${raw.slice(0, 180)}`)
  }
}

function toFeedItem(raw: any, idx: number): FeedItem | null {
  const postId = String(raw?.id || raw?.postId || raw?.feedId || `binance-${idx}`)
  const author =
    raw?.authorName ||
    raw?.publisher?.nickName ||
    raw?.publisher?.nickname ||
    raw?.user?.nickName ||
    raw?.user?.nickname ||
    raw?.userName ||
    raw?.author ||
    'Binance Square'
  const title = typeof raw?.title === 'string' ? raw.title.trim() : ''
  const subTitle = typeof raw?.subTitle === 'string' ? raw.subTitle.trim() : ''
  const text =
    raw?.content ||
    raw?.text ||
    raw?.desc ||
    (title && subTitle ? `${title}\n${subTitle}` : title || subTitle) ||
    ''
  if (!text || typeof text !== 'string') return null
  const linkCandidate =
    raw?.webLink ||
    raw?.jumpLink ||
    raw?.shareUrl ||
    raw?.shareLink ||
    raw?.jumpUrl ||
    raw?.link ||
    raw?.url
  const link =
    typeof linkCandidate === 'string' && linkCandidate.startsWith('http')
      ? linkCandidate
      : `https://www.binance.com/zh-CN/square/post/${postId}`
  const avatarUrl =
    raw?.authorAvatar ||
    raw?.avatarUrl ||
    raw?.publisher?.avatar ||
    raw?.publisher?.avatarUrl ||
    raw?.user?.avatar ||
    raw?.user?.avatarUrl
  const imageUrl = Array.isArray(raw?.images)
    ? raw.images.find((v: unknown) => typeof v === 'string' && v.startsWith('http'))
    : undefined
  const pairs = Array.isArray(raw?.tradingPairs)
    ? raw.tradingPairs
    : Array.isArray(raw?.coinPairList)
      ? raw.coinPairList
      : Array.isArray(raw?.tradingPairsV2)
        ? raw.tradingPairsV2
        : []
  const pairTags = pairs
    .map((p: any) => (typeof p === 'string' ? p : p?.symbol || p?.code || p?.assetCode))
    .filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
    .slice(0, 5)
  const hashtagTags = Array.isArray(raw?.hashtagList)
    ? raw.hashtagList
        .map((h: any) => (typeof h === 'string' ? h : h?.name || h?.title))
        .filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
        .map((v: string) => (v.startsWith('#') ? v : `#${v}`))
        .slice(0, 5)
    : []
  const tags = [...pairTags, ...hashtagTags].slice(0, 8)
  const ts = Number(raw?.date || raw?.createTime || raw?.publishTime || raw?.timestamp || Date.now())
  const handle =
    raw?.authorName && typeof raw.authorName === 'string'
      ? `@${raw.authorName.replace(/\s+/g, '')}`
      : raw?.publisher?.userName
        ? `@${raw.publisher.userName}`
        : 'binance.com/square'
  const verified =
    Boolean(raw?.authorIsVerified) ||
    Number(raw?.authorVerificationType || 0) > 0 ||
    Boolean(raw?.publisher?.verified || raw?.publisher?.isVerified)

  return {
    id: `bn-${postId}`,
    source: 'binance',
    author,
    handle,
    avatarColor: 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/40',
    avatarLabel: String(author).slice(0, 2).toUpperCase(),
    avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : undefined,
    verified,
    time: relativeTime(ts),
    content: text,
    link,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
    category: raw?.cardType || raw?.contentType || raw?.type || raw?.category || 'SQUARE',
    tags: tags.length > 0 ? tags : undefined,
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
      const json = parseJsonLoose(raw)
      const arr = pickFeedArray(json)
      const parsed = arr
        .map((item, idx) => toFeedItem(item, idx))
        .filter((item): item is FeedItem => Boolean(item))
      setItems(parsed)
      setStatus('connected')
      if (parsed.length === 0) {
        const code = json?.code
        const message = json?.message || json?.msg
        if (code !== undefined || message) {
          setError(`请求成功但无内容：code=${String(code ?? '')} ${String(message ?? '')}`.trim())
        } else {
          setError('请求成功但未解析到可展示内容')
        }
      }
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
