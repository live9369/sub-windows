import * as React from 'react'
import { Filter, Inbox } from 'lucide-react'
import { CardTrafficLights } from '@/components/CardTrafficLights'
import { ChatMessage } from '@/components/ChatMessage'
import {
  DEFAULT_FILTER,
  FilterPanelContent,
  isFilterActive,
} from '@/components/FilterPanel'
import { Badge } from '@/components/ui/badge'
import { Popover } from '@/components/ui/popover'
import {
  cn,
  detectMarketCaps,
  detectTokens,
  matchKeywords,
  parseMarketCap,
} from '@/lib/utils'
import type { ChatMessage as ChatMsg, FilterState, TelegramGroup } from '@/types'

export interface GroupCardProps {
  group: TelegramGroup
  messages: ChatMsg[]
  globalQuery?: string
  refreshTick?: number
  /** 是否处于 Focus 模式的"主格"。 */
  isFocused?: boolean
  /** Focus 模式可见时调用，用于切换主格 / 进入 Focus 模式。 */
  onFocus?: () => void
  /** 处于 Focus 主格时调用，退出 Focus 模式。 */
  onExitFocus?: () => void
  /** 在网格模式下调用，从面板移除该卡片。 */
  onRemove?: () => void
  className?: string
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  messages,
  globalQuery,
  refreshTick,
  isFocused,
  onFocus,
  onExitFocus,
  onRemove,
  className,
}) => {
  const [filter, setFilter] = React.useState<FilterState>(DEFAULT_FILTER)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const filterBtnRef = React.useRef<HTMLButtonElement | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const filtered = React.useMemo(() => {
    return messages.filter((m) => {
      const { content } = m
      const lower = content.toLowerCase()
      const q = (globalQuery ?? '').trim().toLowerCase()

      if (q) {
        if (!lower.includes(q) && !m.username.toLowerCase().includes(q)) {
          return false
        }
      }

      if (filter.blacklist.trim()) {
        const blacklisted = matchKeywords(content, filter.blacklist) ||
                           matchKeywords(m.username, filter.blacklist)
        if (blacklisted) return false
      }

      if (filter.whitelist.trim()) {
        if (!matchKeywords(content, filter.whitelist)) return false
      }

      const tokens = detectTokens(content)
      if (filter.onlyWithCa && tokens.length === 0) return false

      if (filter.minMarketCap > 0) {
        const caps = detectMarketCaps(content)
        if (caps.length === 0) return false
        const maxCap = Math.max(...caps.map((c) => parseMarketCap(c.raw)))
        if (maxCap < filter.minMarketCap) return false
      }

      return true
    })
  }, [messages, filter, globalQuery])

  React.useEffect(() => {
    if (collapsed) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [filtered.length, refreshTick, group.id, collapsed])

  const filterActive = isFilterActive(filter)

  // Traffic-light handlers
  const handleClose = isFocused
    ? onExitFocus
    : onRemove
  const handleMinimize = () => setCollapsed((v) => !v)
  const handleMaximize = isFocused ? onExitFocus : onFocus

  return (
    <section
      className={cn(
        'flex flex-col min-w-0 min-h-0 bg-zinc-950',
        'border border-zinc-800/80 rounded-md overflow-hidden',
        'transition-colors',
        collapsed ? 'h-auto' : 'h-full',
        isFocused
          ? 'border-emerald-500/40 shadow-[0_0_24px_rgba(0,255,157,0.08)]'
          : 'hover:border-zinc-700/80',
        className,
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'flex items-center justify-between px-2.5 h-8 shrink-0',
          'border-b border-zinc-800/80',
          'bg-gradient-to-b from-zinc-900/80 to-zinc-950',
          collapsed && 'border-b-0',
        )}
        onDoubleClick={(e) => {
          if (e.target === e.currentTarget) handleMinimize()
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CardTrafficLights
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            isMaximized={isFocused}
            isCollapsed={collapsed}
            closeTitle={isFocused ? '退出 Focus' : '关闭卡片'}
            minimizeTitle="折叠"
            maximizeTitle="进入 Focus"
          />
          <span className="text-sm leading-none">{group.emoji}</span>
          <h3 className="text-[12px] font-semibold text-zinc-100 truncate">
            {group.name}
          </h3>
          <span className="text-[9px] font-mono text-zinc-500 shrink-0">
            {filtered.length}
            {filtered.length !== messages.length && (
              <span className="text-zinc-600">/{messages.length}</span>
            )}
          </span>
          {group.unread > 0 && (
            <Badge variant="orange" className="h-4 px-1 text-[9px]">
              {group.unread}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 mr-1"
            title="模拟实时"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 signal-pulse" />
            LIVE
          </span>
          <button
            ref={filterBtnRef}
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              'relative inline-flex items-center justify-center w-6 h-6 rounded',
              'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70',
              filterOpen && 'bg-zinc-800/70 text-zinc-100',
              filterActive && 'text-emerald-300',
            )}
            title="过滤"
            aria-label="过滤"
          >
            <Filter className="w-3.5 h-3.5" />
            {filterActive && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Messages */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto divide-y divide-zinc-900/80"
        >
          {filtered.length === 0
            ? <EmptyState />
            : filtered.map((m) => (
              <ChatMessage key={m.id} message={m} query={globalQuery} />
            ))}
        </div>
      )}

      <Popover
        open={filterOpen}
        onOpenChange={setFilterOpen}
        anchor={filterBtnRef}
      >
        <FilterPanelContent
          state={filter}
          onChange={setFilter}
          matchCount={filtered.length}
          totalCount={messages.length}
        />
      </Popover>
    </section>
  )
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-zinc-500">
    <Inbox className="w-6 h-6 mb-1.5 text-zinc-600" />
    <p className="text-[11px]">无匹配消息</p>
    <p className="text-[10px] text-zinc-600 mt-0.5">
      调整过滤条件或清空关键词
    </p>
  </div>
)
