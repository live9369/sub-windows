import * as React from 'react'
import { Inbox, Settings } from 'lucide-react'
import { FeedCard } from '@/components/FeedCard'
import type { FeedItem } from '@/types'

export interface FeedPanelProps {
  items: FeedItem[]
  globalQuery?: string
  refreshTick?: number
  footerLabel?: string
  emptyHint?: string
  onOpenSettings?: () => void
}

export const FeedPanel: React.FC<FeedPanelProps> = ({
  items,
  globalQuery,
  refreshTick,
  footerLabel,
  emptyHint,
  onOpenSettings,
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
        <p className="text-xs text-zinc-300">
          {items.length === 0 ? '尚未接入此数据源' : '没有匹配的内容'}
        </p>
        {items.length === 0 && emptyHint && (
          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">{emptyHint}</p>
        )}
        {items.length === 0 && onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-3 inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
          >
            <Settings className="w-3.5 h-3.5" />
            打开设置
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      {filtered.map((item) => (
        <FeedCard key={item.id} item={item} query={globalQuery} />
      ))}
      <div className="px-3 py-6 text-center text-[10px] font-mono text-zinc-600">
        — 已加载 {filtered.length} 条{footerLabel ? ` · ${footerLabel}` : ''} —
      </div>
    </div>
  )
}
