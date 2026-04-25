import * as React from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { FilterState } from '@/types'

export const DEFAULT_FILTER: FilterState = {
  minMarketCap: 0,
  whitelist: '',
  blacklist: '',
  onlyWithCa: false,
}

export function isFilterActive(state: FilterState): boolean {
  return (
    state.minMarketCap > 0 ||
    state.whitelist.trim() !== '' ||
    state.blacklist.trim() !== '' ||
    state.onlyWithCa
  )
}

export interface FilterPanelContentProps {
  state: FilterState
  onChange: (next: FilterState) => void
  matchCount: number
  totalCount: number
  className?: string
}

const FieldLabel: React.FC<{
  children: React.ReactNode
  hint?: string
}> = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-1">
    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
      {children}
    </span>
    {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
  </div>
)

export const FilterPanelContent: React.FC<FilterPanelContentProps> = ({
  state,
  onChange,
  matchCount,
  totalCount,
  className,
}) => {
  const update = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...state, [k]: v })

  const reset = () => onChange(DEFAULT_FILTER)
  const isFiltered = matchCount !== totalCount

  return (
    <div className={cn('w-72', className)}>
      <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200">过滤</span>
        </div>
        <Badge variant={isFiltered ? 'neon' : 'muted'}>
          {matchCount}/{totalCount}
        </Badge>
      </div>

      <div className="px-3 py-3 space-y-4">
        <div>
          <FieldLabel hint="K / M / B 单位">最低市值</FieldLabel>
          <div className="relative">
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={state.minMarketCap || ''}
              onChange={(e) => update('minMarketCap', Number(e.target.value) || 0)}
              className="h-8 pr-8 text-xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500">
              USD
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {[
              { label: '$10K',  value: 10_000 },
              { label: '$50K',  value: 50_000 },
              { label: '$100K', value: 100_000 },
              { label: '$1M',   value: 1_000_000 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => update('minMarketCap', value)}
                className={cn(
                  'px-1.5 h-5 rounded text-[10px] font-mono border',
                  state.minMarketCap === value
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel hint="逗号 / 空格分隔">关键词白名单</FieldLabel>
          <Input
            placeholder="alpha, gem, 100x"
            value={state.whitelist}
            onChange={(e) => update('whitelist', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <FieldLabel>关键词黑名单</FieldLabel>
          <Input
            placeholder="rug, scam, honeypot"
            value={state.blacklist}
            onChange={(e) => update('blacklist', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="flex items-center justify-between p-2 -mx-1 rounded-md bg-zinc-900/60 border border-zinc-800">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-200">仅显示含 CA</span>
            <span className="text-[10px] text-zinc-500">隐藏纯聊天</span>
          </div>
          <Switch
            checked={state.onlyWithCa}
            onCheckedChange={(v) => update('onlyWithCa', v)}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={reset}
        >
          <RotateCcw className="w-3 h-3" />
          重置过滤
        </Button>

        <div className="pt-3 border-t border-zinc-800">
          <FieldLabel>当前激活</FieldLabel>
          <div className="flex flex-wrap gap-1">
            {state.minMarketCap > 0 && (
              <ActiveTag onClear={() => update('minMarketCap', 0)}>
                MC ≥ ${state.minMarketCap.toLocaleString()}
              </ActiveTag>
            )}
            {state.whitelist && (
              <ActiveTag onClear={() => update('whitelist', '')}>
                ✓ {state.whitelist.slice(0, 18)}
              </ActiveTag>
            )}
            {state.blacklist && (
              <ActiveTag onClear={() => update('blacklist', '')}>
                ✗ {state.blacklist.slice(0, 18)}
              </ActiveTag>
            )}
            {state.onlyWithCa && (
              <ActiveTag onClear={() => update('onlyWithCa', false)}>
                仅含 CA
              </ActiveTag>
            )}
            {!isFiltered && !isFilterActive(state) && (
              <span className="text-[10px] text-zinc-600">无激活过滤</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ActiveTag: React.FC<{
  children: React.ReactNode
  onClear: () => void
}> = ({ children, onClear }) => (
  <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px]">
    {children}
    <button
      onClick={onClear}
      className="opacity-70 hover:opacity-100"
      aria-label="移除"
    >
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
)
