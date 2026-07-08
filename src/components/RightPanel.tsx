import * as React from 'react'
import { Newspaper, Twitter, Coins } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedPanel } from '@/components/FeedPanel'
import { MOCK_FEED } from '@/data/mockData'
import type { FeedItem, FeedSource } from '@/types'

export interface RightPanelProps {
  globalQuery?: string
  refreshTick?: number
  newsItems?: FeedItem[]
  binanceItems?: FeedItem[]
  binanceStatus?: string
  twitterItems?: FeedItem[]
  twitterStatus?: string
}

const TABS: { value: FeedSource; label: string; icon: React.ReactNode }[] = [
  { value: 'x',       label: 'X',         icon: <Twitter className="w-3.5 h-3.5" /> },
  { value: 'binance', label: '币安广场', icon: <Coins className="w-3.5 h-3.5" /> },
  { value: 'news',    label: '新闻',     icon: <Newspaper className="w-3.5 h-3.5" /> },
]

export const RightPanel: React.FC<RightPanelProps> = ({
  globalQuery,
  refreshTick,
  newsItems = [],
  binanceItems = [],
  binanceStatus,
  twitterItems = [],
  twitterStatus,
}) => {
  const [active, setActive] = React.useState<FeedSource>('x')
  const [unreadNews, setUnreadNews] = React.useState(0)
  const seenNewsIdsRef = React.useRef<Set<string>>(new Set())
  const hasInitRef = React.useRef(false)

  // Track unread news when new items arrive
  React.useEffect(() => {
    if (newsItems.length === 0) {
      hasInitRef.current = false
      return
    }
    const currentIds = new Set(newsItems.map((i) => i.id))
    if (!hasInitRef.current) {
      seenNewsIdsRef.current = currentIds
      hasInitRef.current = true
      return
    }
    const newIds = newsItems.filter((i) => !seenNewsIdsRef.current.has(i.id))
    if (newIds.length > 0 && active !== 'news') {
      setUnreadNews((prev) => prev + newIds.length)
    }
    seenNewsIdsRef.current = currentIds
  }, [newsItems])

  // Clear unread when switching to news tab
  const handleTabChange = (v: FeedSource) => {
    setActive(v)
    if (v === 'news') {
      setUnreadNews(0)
    }
  }

  const itemsBySource = React.useMemo(() => {
    const out: Record<FeedSource, FeedItem[]> = {
      x: [], binance: [], news: [],
    }
    for (const i of MOCK_FEED) {
      if (i.source === 'x' && (twitterItems.length > 0 || twitterStatus !== 'idle')) continue
      if (i.source === 'binance' && (binanceItems.length > 0 || binanceStatus !== 'idle')) continue
      out[i.source].push(i)
    }
    // Replace mock Binance with real Binance Square feed
    if (binanceItems.length > 0) {
      out.binance = binanceItems
    } else if (binanceStatus && binanceStatus !== 'idle') {
      const statusText =
        binanceStatus === 'connecting'
          ? '正在拉取币安广场数据…'
          : binanceStatus === 'error'
            ? '拉取失败，请检查设置中的 curl 命令是否有效'
            : '已连接，等待下一次轮询…'
      out.binance = [
        {
          id: 'binance-status-placeholder',
          source: 'binance',
          author: '系统',
          handle: '@system',
          avatarColor: 'bg-zinc-800 text-zinc-500',
          avatarLabel: 'SYS',
          time: '',
          content: statusText,
          link: '',
          category: binanceStatus === 'error' ? 'ERROR' : 'CONNECTING',
        },
      ]
    }
    // Replace mock X with real Twitter stream
    if (twitterItems.length > 0) {
      out.x = twitterItems
    } else if (twitterStatus && twitterStatus !== 'idle') {
      // WSS enabled but no items yet — show status placeholder
      const statusText =
        twitterStatus === 'connecting'
          ? '正在连接 Twitter WSS 服务器…'
          : twitterStatus === 'error'
            ? '连接失败，请检查 WSS 地址和 Token'
            : '已连接，等待服务器推送 tweet…'
      out.x = [
        {
          id: 'twitter-status-placeholder',
          source: 'x',
          author: '系统',
          handle: '@system',
          avatarColor: 'bg-zinc-800 text-zinc-500',
          avatarLabel: 'SYS',
          time: '',
          content: statusText,
          link: '',
          category: twitterStatus === 'error' ? 'ERROR' : 'CONNECTING',
        },
      ]
    }
    // Replace mock news with real BlockBeats news
    out.news = newsItems.length > 0 ? newsItems : out.news
    return out
  }, [binanceItems, binanceStatus, newsItems, twitterItems, twitterStatus])

  return (
    <section className="flex flex-col h-full min-h-0 bg-zinc-950">
      <div className="flex items-center justify-between px-3 h-10 shrink-0 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">信息流</h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-500">
          {MOCK_FEED.length} ITEMS
        </div>
      </div>

      <Tabs
        value={active}
        onValueChange={(v) => handleTabChange(v as FeedSource)}
        className="flex-1 min-h-0"
      >
        <div className="px-2 pt-2 pb-1.5 shrink-0 border-b border-zinc-800/80 bg-zinc-950">
          <TabsList className="w-full">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1">
                {t.icon}
                <span className="font-medium">{t.label}</span>
                {t.value === 'news' && unreadNews > 0 && (
                  <span className="ml-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1">
                    {unreadNews > 99 ? '99+' : unreadNews}
                  </span>
                )}
                {!(t.value === 'news' && unreadNews > 0) && (
                  <span className="text-[10px] font-mono text-zinc-500 ml-1">
                    {itemsBySource[t.value].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <FeedPanel
              items={itemsBySource[t.value]}
              globalQuery={globalQuery}
              refreshTick={refreshTick}
              footerLabel={
                t.value === 'x' && twitterItems.length > 0
                  ? 'WSS 实时流'
                  : t.value === 'binance' && binanceItems.length > 0
                    ? 'Binance Square'
                  : t.value === 'news' && newsItems.length > 0
                    ? 'BlockBeats'
                    : 'MOCK 数据'
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
