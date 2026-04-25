import * as React from 'react'
import { Inbox } from 'lucide-react'
import { FeedCard } from '@/components/FeedCard'
import type { FeedItem } from '@/types'

export interface FeedPanelProps {
  items: FeedItem[]
  globalQuery?: string
  refreshTick?: number
}

export const FeedPanel: React.FC<FeedPanelProps> = ({
  items,
  globalQuery,
  refreshTick,
}) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const filtered = React.useMemo(() => {
    const q = (globalQuery ?? '').trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      i.content.toLowerCase().includes(q) ||
      i.author.toLowerCase().includes(q) ||
      i.handle.toLowerCase().includes(q) ||
      (i.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    )
  }, [items, globalQuery])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
  }, [refreshTick])

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 text-zinc-500">
        <Inbox className="w-7 h-7 mb-2 text-zinc-600" />
        <p className="text-xs">没有匹配的内容</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      {filtered.map((item) => (
        <FeedCard key={item.id} item={item} query={globalQuery} />
      ))}
      <div className="px-3 py-6 text-center text-[10px] font-mono text-zinc-600">
        — 已加载 {filtered.length} 条 · MOCK 数据 —
      </div>
    </div>
  )
}
