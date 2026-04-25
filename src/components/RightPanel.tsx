import * as React from 'react'
import { Newspaper, Twitter, Coins } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedPanel } from '@/components/FeedPanel'
import { MOCK_FEED } from '@/data/mockData'
import type { FeedSource } from '@/types'

export interface RightPanelProps {
  globalQuery?: string
  refreshTick?: number
}

const TABS: { value: FeedSource; label: string; icon: React.ReactNode }[] = [
  { value: 'x',       label: 'X',         icon: <Twitter className="w-3.5 h-3.5" /> },
  { value: 'binance', label: '币安广场', icon: <Coins className="w-3.5 h-3.5" /> },
  { value: 'news',    label: '新闻',     icon: <Newspaper className="w-3.5 h-3.5" /> },
]

export const RightPanel: React.FC<RightPanelProps> = ({
  globalQuery,
  refreshTick,
}) => {
  const [active, setActive] = React.useState<FeedSource>('x')

  const itemsBySource = React.useMemo(() => {
    const out: Record<FeedSource, typeof MOCK_FEED> = {
      x: [], binance: [], news: [],
    }
    for (const i of MOCK_FEED) out[i.source].push(i)
    return out
  }, [])

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
        onValueChange={(v) => setActive(v as FeedSource)}
        className="flex-1 min-h-0"
      >
        <div className="px-2 pt-2 pb-1.5 shrink-0 border-b border-zinc-800/80 bg-zinc-950">
          <TabsList className="w-full">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1">
                {t.icon}
                <span className="font-medium">{t.label}</span>
                <span className="text-[10px] font-mono text-zinc-500 ml-1">
                  {itemsBySource[t.value].length}
                </span>
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
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
