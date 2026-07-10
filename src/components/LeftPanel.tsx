import * as React from 'react'
import { MessageSquare, Plus, Inbox, WifiOff, Settings } from 'lucide-react'
import { GroupCard } from '@/components/GroupCard'
import { WechatOnboarding } from '@/components/WechatOnboarding'
import { Popover } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ChatMessage, MonitoredGroup } from '@/types'

export interface LeftPanelProps {
  globalQuery?: string
  refreshTick?: number
  wxGroups?: MonitoredGroup[]
  wxMessagesByGroup?: Record<string, ChatMessage[]>
  wxStatus?: string
  wxError?: string | null
  onRetryWechat?: () => void
  onOpenSettings?: () => void
}

type LayoutId = '2col' | '3col' | 'focus'
type SourceTab = 'telegram' | 'wechat' | 'all'

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: '2col',  label: '2 列' },
  { id: '3col',  label: '3 列' },
  { id: 'focus', label: 'Focus' },
]

const SOURCE_TABS: { id: SourceTab; label: string }[] = [
  { id: 'telegram', label: 'TG' },
  { id: 'wechat', label: 'WX' },
  { id: 'all', label: '全部' },
]

export const LeftPanel: React.FC<LeftPanelProps> = ({
  globalQuery,
  refreshTick,
  wxGroups = [],
  wxMessagesByGroup = {},
  wxStatus,
  wxError,
  onRetryWechat,
  onOpenSettings,
}) => {
  const [sourceTab, setSourceTab] = React.useState<SourceTab>('telegram')
  const [layout, setLayout] = React.useState<LayoutId>('3col')
  const [activeIds, setActiveIds] = React.useState<string[]>([])
  const [focusedId, setFocusedId] = React.useState<string>('')
  const [addOpen, setAddOpen] = React.useState(false)
  const addBtnRef = React.useRef<HTMLButtonElement | null>(null)

  const allGroups = wxGroups

  React.useEffect(() => {
    const discoveredIds = allGroups.map((g) => g.id)
    if (discoveredIds.length === 0) return
    setActiveIds((prev) => {
      const next = [...prev]
      let changed = false
      for (const id of discoveredIds) {
        if (!next.includes(id)) {
          next.push(id)
          changed = true
        }
      }
      return changed ? next : prev
    })
    setFocusedId((prev) => prev || discoveredIds[0])
  }, [allGroups])

  const messagesByGroup = wxMessagesByGroup

  const groupMap = React.useMemo(() => {
    const m: Record<string, MonitoredGroup> = {}
    for (const g of allGroups) m[g.id] = g
    return m
  }, [allGroups])

  const visibleGroups = React.useMemo(
    () => allGroups.filter((g) => sourceTab === 'all' || g.source === sourceTab),
    [allGroups, sourceTab],
  )

  const enterFocus = (id: string) => {
    setFocusedId(id)
    setLayout('focus')
  }

  const removeCard = (id: string) => {
    setActiveIds((prev) => prev.filter((x) => x !== id))
  }

  const addCard = (id: string) => {
    setActiveIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setAddOpen(false)
  }

  const unusedGroups = visibleGroups.filter((g) => !activeIds.includes(g.id))
  const activeGroups = activeIds
    .map((id) => groupMap[id])
    .filter((g): g is MonitoredGroup => !!g && visibleGroups.some((vg) => vg.id === g.id))

  // Focus mode: thumbnail rail shows all visible groups except the focused one
  const focusedGroup = visibleGroups.find((g) => g.id === focusedId) ?? visibleGroups[0]
  const otherGroups = focusedGroup
    ? visibleGroups.filter((g) => g.id !== focusedGroup.id)
    : []

  const isWxOffline = sourceTab === 'wechat' && wxStatus !== 'connected'
  const showEmpty = activeGroups.length === 0 || (layout === 'focus' && !focusedGroup)

  return (
    <section className="flex flex-col h-full min-h-0 border-r border-zinc-800 bg-zinc-950">
      {/* Section header */}
      <div className="flex items-center justify-between px-3 h-10 shrink-0 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">群聊监控</h2>
          <span className="text-[10px] font-mono text-zinc-500">
            {layout === 'focus'
              ? `FOCUS · ${focusedGroup.name}`
              : `${activeGroups.length} / ${visibleGroups.length} 卡片`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Source tabs */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-md bg-zinc-900/80 border border-zinc-800 mr-1"
            role="tablist"
            aria-label="来源切换"
          >
            {SOURCE_TABS.map((t) => {
              const active = sourceTab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSourceTab(t.id)}
                  className={cn(
                    'inline-flex items-center justify-center h-6 px-1.5 rounded text-[10px] font-medium transition-colors',
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'text-zinc-400 hover:text-zinc-100',
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Add card button — only shown in grid modes */}
          {layout !== 'focus' && (
            <button
              ref={addBtnRef}
              onClick={() => unusedGroups.length > 0 && setAddOpen((v) => !v)}
              disabled={unusedGroups.length === 0}
              className={cn(
                'inline-flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-medium',
                'border transition-colors',
                unusedGroups.length === 0
                  ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : addOpen
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700',
              )}
              title={unusedGroups.length === 0 ? '所有群已添加' : '添加卡片'}
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">加卡片</span>
            </button>
          )}

          {/* Layout switcher */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-md bg-zinc-900/80 border border-zinc-800"
            role="tablist"
            aria-label="布局切换"
          >
            {LAYOUTS.map((l) => {
              const active = layout === l.id
              return (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLayout(l.id)}
                  className={cn(
                    'inline-flex items-center justify-center h-6 px-1.5 gap-1 rounded text-[10px] font-medium',
                    'transition-colors',
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'text-zinc-400 hover:text-zinc-100',
                  )}
                  title={`布局：${l.label}`}
                >
                  <LayoutIcon id={l.id} active={active} />
                  <span className="hidden sm:inline">{l.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 overflow-hidden">
        {showEmpty
            ? sourceTab === 'wechat'
              ? (
                <WechatOnboarding
                  wxStatus={wxStatus}
                  wxError={wxError}
                  onOpenSettings={onOpenSettings}
                  onRetry={onRetryWechat}
                />
              )
              : (
                <EmptyGrid
                  sourceTab={sourceTab}
                  wxStatus={wxStatus}
                  wxError={wxError}
                  onAdd={() => setAddOpen(true)}
                  onRetry={onRetryWechat}
                  onOpenSettings={onOpenSettings}
                />
              )
            : layout === 'focus' && focusedGroup
              ? (
                <FocusLayout
                  focused={focusedGroup}
                  others={otherGroups}
                  messagesByGroup={messagesByGroup}
                  globalQuery={globalQuery}
                  refreshTick={refreshTick}
                  onSwap={(id) => setFocusedId(id)}
                  onExit={() => setLayout('3col')}
                />
              )
              : (
                <div
                  className={cn(
                    'grid gap-2 h-full overflow-y-auto pr-0.5',
                    layout === '2col' ? 'grid-cols-2' : 'grid-cols-3',
                    '[grid-auto-rows:minmax(220px,1fr)]',
                  )}
                >
                  {activeGroups.map((g) => (
                    <GroupCard
                      key={g.id}
                      group={g}
                      messages={messagesByGroup[g.id] ?? []}
                      globalQuery={globalQuery}
                      refreshTick={refreshTick}
                      onFocus={() => enterFocus(g.id)}
                      onRemove={() => removeCard(g.id)}
                      offline={g.source === 'wechat' && wxStatus !== 'connected'}
                      offlineActions={[
                        ...(onRetryWechat ? [{ label: '重试', onClick: onRetryWechat }] : []),
                        ...(onOpenSettings ? [{ label: '打开设置', onClick: onOpenSettings }] : []),
                      ]}
                    />
                  ))}
                </div>
              )}
      </div>

      {/* Add-card popover */}
      <Popover
        open={addOpen}
        onOpenChange={setAddOpen}
        anchor={addBtnRef}
        align="end"
      >
        <div className="w-56">
          <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">添加卡片</span>
            <span className="text-[10px] font-mono text-zinc-500">
              {unusedGroups.length} 个可用
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {unusedGroups.length === 0
              ? (
                <p className="px-3 py-3 text-[11px] text-zinc-500">
                  所有群都已显示。
                </p>
              )
              : (
                <>
                  {sourceTab === 'all' && (
                    <div className="px-3 py-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      {sourceTab === 'all' ? '全部来源' : ''}
                    </div>
                  )}
                  {unusedGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => addCard(g.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/70 text-left"
                    >
                      <span className="text-base leading-none">{g.emoji}</span>
                      <span className="flex-1 text-[12px] text-zinc-100 truncate">
                        {g.name}
                      </span>
                      {g.source === 'wechat' && (
                        <span className="text-[9px] font-mono text-zinc-500 border border-zinc-700 rounded px-1">
                          WX
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-500">
                        {messagesByGroup[g.id]?.length ?? 0}
                      </span>
                    </button>
                  ))}
                </>
              )}
          </div>
        </div>
      </Popover>
    </section>
  )
}

interface FocusLayoutProps {
  focused: MonitoredGroup
  others: MonitoredGroup[]
  messagesByGroup: Record<string, ChatMessage[]>
  globalQuery?: string
  refreshTick?: number
  onSwap: (id: string) => void
  onExit: () => void
}

const FocusLayout: React.FC<FocusLayoutProps> = ({
  focused,
  others,
  messagesByGroup,
  globalQuery,
  refreshTick,
  onSwap,
  onExit,
}) => (
  <div className="flex h-full gap-2 min-h-0">
    {/* Thumbnail rail */}
    <aside className="shrink-0 w-32 flex flex-col gap-1.5 overflow-y-auto pr-0.5">
      {others.map((g) => {
        const total = messagesByGroup[g.id]?.length ?? 0
        const lastMsg = messagesByGroup[g.id]?.[total - 1]
        return (
          <button
            key={g.id}
            onClick={() => onSwap(g.id)}
            className={cn(
              'flex flex-col items-start text-left p-2 rounded-md',
              'border border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900/70',
              'hover:border-zinc-700 transition-colors group',
            )}
            title={`切换到 ${g.name}`}
          >
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <span className="text-sm leading-none">{g.emoji}</span>
              <span className="text-[11px] font-semibold text-zinc-100 truncate flex-1">
                {g.name}
              </span>
              {g.source === 'wechat' && (
                <span className="text-[9px] font-mono text-zinc-500 shrink-0">WX</span>
              )}
              {g.unread > 0 && (
                <span className="text-[9px] font-mono text-orange-300 shrink-0">
                  {g.unread}
                </span>
              )}
            </div>
            <span className="mt-1 text-[10px] text-zinc-500 line-clamp-2 break-words">
              {lastMsg?.content.slice(0, 60) ?? '—'}
            </span>
            <span className="mt-1 text-[9px] font-mono text-zinc-600">
              {total} 条 · {lastMsg?.time ?? '--'}
            </span>
          </button>
        )
      })}
    </aside>

    {/* Main focused card */}
    <div className="flex-1 min-w-0 min-h-0">
      <GroupCard
        group={focused}
        messages={messagesByGroup[focused.id] ?? []}
        globalQuery={globalQuery}
        refreshTick={refreshTick}
        isFocused
        onExitFocus={onExit}
      />
    </div>
  </div>
)

const EmptyGrid: React.FC<{
  sourceTab: SourceTab
  wxStatus?: string
  wxError?: string | null
  onAdd: () => void
  onRetry?: () => void
  onOpenSettings?: () => void
}> = ({ sourceTab, wxStatus, wxError, onAdd, onRetry, onOpenSettings }) => {
  const isWxDown = sourceTab === 'wechat' && wxStatus !== 'connected'
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      {isWxDown ? (
        <WifiOff className="w-8 h-8 text-zinc-600" />
      ) : (
        <Inbox className="w-8 h-8 text-zinc-600" />
      )}
      <div>
        <p className="text-xs text-zinc-300">
          {isWxDown ? '微信服务未连接' : '尚未接入群聊数据源'}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5 max-w-xs">
          {isWxDown
            ? (wxError || '请先在设置中填写你的 wechat-decrypt 地址并启动服务')
            : sourceTab === 'telegram'
              ? '在设置中配置你的 Telegram Bot 推送或 Telegram 账号，连接成功后群会自动出现'
              : '在设置中接入你的数据源；有可用群后点「加卡片」加入监控'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isWxDown && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
          >
            重试连接
          </button>
        )}
        {isWxDown && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            <Settings className="w-3.5 h-3.5" />
            打开设置
          </button>
        )}
        {!isWxDown && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
          >
            <Plus className="w-3.5 h-3.5" />
            添加卡片
          </button>
        )}
      </div>
    </div>
  )
}

const LayoutIcon: React.FC<{ id: LayoutId; active: boolean }> = ({ id, active }) => {
  const fill = 'currentColor'
  const op = active ? 1 : 0.85
  if (id === '2col') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden style={{ opacity: op }}>
        <rect x="1" y="1" width="4" height="10" rx="1" fill={fill} />
        <rect x="7" y="1" width="4" height="10" rx="1" fill={fill} />
      </svg>
    )
  }
  if (id === '3col') {
    return (
      <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden style={{ opacity: op }}>
        <rect x="0.5" y="1" width="3.5" height="10" rx="1" fill={fill} />
        <rect x="5.25" y="1" width="3.5" height="10" rx="1" fill={fill} />
        <rect x="10" y="1" width="3.5" height="10" rx="1" fill={fill} />
      </svg>
    )
  }
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden style={{ opacity: op }}>
      <rect x="0.5" y="1" width="9" height="10" rx="1" fill={fill} />
      <rect x="10.5" y="1" width="3" height="3" rx="0.6" fill={fill} opacity="0.6" />
      <rect x="10.5" y="4.75" width="3" height="3" rx="0.6" fill={fill} opacity="0.6" />
      <rect x="10.5" y="8.5" width="3" height="2.5" rx="0.6" fill={fill} opacity="0.6" />
    </svg>
  )
}
