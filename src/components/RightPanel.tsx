import * as React from 'react'
import { Newspaper, Twitter, Coins } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedPanel } from '@/components/FeedPanel'
import type { FeedItem, FeedSource } from '@/types'

export interface RightPanelProps {
  globalQuery?: string
  refreshTick?: number
  newsItems?: FeedItem[]
  binanceItems?: FeedItem[]
  binanceStatus?: string
  binanceError?: string | null
  twitterItems?: FeedItem[]
  twitterStatus?: string
  onOpenSettings?: () => void
}

const TABS: { value: FeedSource; label: string; icon: React.ReactNode }[] = [
  { value: 'x',       label: 'X',         icon: <Twitter className="w-3.5 h-3.5" /> },
  { value: 'binance', label: '币安广场', icon: <Coins className="w-3.5 h-3.5" /> },
  { value: 'news',    label: '新闻',     icon: <Newspaper className="w-3.5 h-3.5" /> },
]

const EMPTY_HINTS: Record<FeedSource, string> = {
  x: '在设置中填写你的 Twitter WSS 地址与 Token，由你的推送服务提供数据',
  binance: '在设置中粘贴你的币安广场 curl（含 cookie / token），由你的账号拉取',
  news: '在设置中启用 BlockBeats 并填写你的 API Key',
}

function statusPlaceholder(
  source: FeedSource,
  status: string,
  error?: string | null,
): FeedItem {
  const statusText =
    status === 'connecting'
      ? '正在连接你的数据源…'
      : status === 'error'
        ? `连接失败：${error || '请检查设置中的地址与鉴权'}`
        : '已连接，等待数据推送…'

  return {
    id: `${source}-status-placeholder`,
    source,
    author: '系统',
    handle: '@system',
    avatarColor: 'bg-zinc-800 text-zinc-500',
    avatarLabel: 'SYS',
    time: '',
    content: statusText,
    link: '',
    category: status === 'error' ? 'ERROR' : 'CONNECTING',
  }
}

export const RightPanel: React.FC<RightPanelProps> = ({
  globalQuery,
  refreshTick,
  newsItems = [],
  binanceItems = [],
  binanceStatus,
  binanceError,
  twitterItems = [],
  twitterStatus,
  onOpenSettings,
}) => {
  const [active, setActive] = React.useState<FeedSource>('x')
  const [unreadNews, setUnreadNews] = React.useState(0)
  const seenNewsIdsRef = React.useRef<Set<string>>(new Set())
  const hasInitRef = React.useRef(false)

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
  }, [newsItems, active])

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

    if (twitterItems.length > 0) {
      out.x = twitterItems
    } else if (twitterStatus && twitterStatus !== 'idle') {
      out.x = [statusPlaceholder('x', twitterStatus)]
    }

    if (binanceItems.length > 0) {
      out.binance = binanceItems
    } else if (binanceStatus && binanceStatus !== 'idle') {
      out.binance = [statusPlaceholder('binance', binanceStatus, binanceError)]
    }

    out.news = newsItems
    return out
  }, [binanceError, binanceItems, binanceStatus, newsItems, twitterItems, twitterStatus])

  const totalItems = itemsBySource.x.length + itemsBySource.binance.length + itemsBySource.news.length

  return (
    <section className="flex flex-col h-full min-h-0 bg-zinc-950">
      <div className="flex items-center justify-between px-3 h-10 shrink-0 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">信息流</h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-500">
          {totalItems} ITEMS
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
              emptyHint={EMPTY_HINTS[t.value]}
              onOpenSettings={onOpenSettings}
              footerLabel={
                t.value === 'x' && twitterItems.length > 0
                  ? '你的 WSS 流'
                  : t.value === 'binance' && binanceItems.length > 0
                    ? '你的币安广场'
                    : t.value === 'news' && newsItems.length > 0
                      ? '你的 BlockBeats'
                      : undefined
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
