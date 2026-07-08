import * as React from 'react'
import type { FeedItem } from '@/types'

interface RssItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
}

function parseRss(xml: string): RssItem[] {
  if (!xml.trim().startsWith('<')) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) return []
  const nodes = doc.querySelectorAll('item')
  const out: RssItem[] = []
  nodes.forEach((node) => {
    const title = node.querySelector('title')?.textContent?.trim() || ''
    const description = node.querySelector('description')?.textContent?.trim() || ''
    const link = node.querySelector('link')?.textContent?.trim() || ''
    const pubDate = node.querySelector('pubDate')?.textContent?.trim() || ''
    const guid = node.querySelector('guid')?.textContent?.trim() || link
    out.push({ title, description, link, pubDate, guid })
  })
  return out
}

function relativeTime(rfcDate: string): string {
  const d = new Date(rfcDate)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function rssToFeedItems(items: RssItem[]): FeedItem[] {
  return items.map((it, i) => {
    const authorMatch = it.description.match(/来源：\s*(.+?)(?:\n|$)/)
    const author = authorMatch?.[1]?.trim() || 'BlockBeats'
    const content = it.title || it.description
    return {
      id: `bb-${it.guid || i}`,
      source: 'news',
      author,
      handle: 'theblockbeats.info',
      avatarColor: 'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-500/40',
      avatarLabel: 'BB',
      verified: true,
      time: relativeTime(it.pubDate),
      content,
      link: it.link,
      category: 'NEWS',
    }
  })
}

export interface UseBlockbeatsNewsOptions {
  enabled: boolean
  apiKey: string
  page?: number
  size?: number
  intervalMs?: number
}

export function useBlockbeatsNews(options: UseBlockbeatsNewsOptions) {
  const { enabled, apiKey, page = 1, size = 20, intervalMs = 30000 } = options

  const [items, setItems] = React.useState<FeedItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchNews = React.useCallback(async () => {
    if (!apiKey) {
      setError('请配置 BlockBeats API Key')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const xml = await window.cssApi!.blockbeatsFetch(apiKey, page, size)
      const rss = parseRss(xml)
      if (rss.length === 0) {
        setError('未解析到新闻')
      } else {
        setItems(rssToFeedItems(rss))
      }
    } catch (err: any) {
      setError(err?.message || '获取失败')
    } finally {
      setLoading(false)
    }
  }, [apiKey, page, size])

  React.useEffect(() => {
    if (!enabled) {
      setItems([])
      return
    }
    void fetchNews()
    const timer = window.setInterval(() => {
      void fetchNews()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [enabled, fetchNews, intervalMs])

  return { items, loading, error, refresh: fetchNews }
}
