import * as React from 'react'
import {
  Activity,
  Maximize2,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Wifi,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface TopBarProps {
  globalQuery: string
  onGlobalQueryChange: (v: string) => void
  onRefresh: () => void
  onOpenSettings: () => void
  refreshing?: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  globalQuery,
  onGlobalQueryChange,
  onRefresh,
  onOpenSettings,
  refreshing,
}) => {
  const handleFullscreen = () => {
    void window.cssApi?.toggleFullscreen()
  }

  return (
    <header
      className={cn(
        'titlebar-drag relative flex items-center gap-3 h-12 px-3 shrink-0',
        'border-b border-zinc-800 bg-zinc-950/95 backdrop-blur',
      )}
    >
      {/* macOS 红绿灯位预留：不渲染按钮，但留出空间避免被遮挡 */}
      <div className="w-16 shrink-0" />

      {/* Logo + 标题 */}
      <div className="titlebar-no-drag flex items-center gap-2 shrink-0">
        <div className="relative w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500/40 to-emerald-700/40 flex items-center justify-center ring-1 ring-emerald-400/40">
          <Activity className="w-4 h-4 text-emerald-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 signal-pulse" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold tracking-tight text-zinc-100">
            Crypto Side Screen
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            v0.1 · degen monitor
          </span>
        </div>
      </div>

      {/* 全局过滤搜索框 */}
      <div className="titlebar-no-drag flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <Input
            value={globalQuery}
            onChange={(e) => onGlobalQueryChange(e.target.value)}
            placeholder="全局过滤  ·  CA / 代币 / 关键词…"
            className="pl-8 h-8 text-xs bg-zinc-900/80"
          />
          {globalQuery && (
            <button
              onClick={() => onGlobalQueryChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-zinc-200"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 右侧动作区 */}
      <div className="titlebar-no-drag flex items-center gap-1.5 shrink-0">
        <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md bg-zinc-900/70 border border-zinc-800 text-[10px] font-mono text-emerald-300">
          <Wifi className="w-3 h-3" />
          MOCK
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRefresh}
          title="全局刷新"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin text-emerald-300')} />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleFullscreen} title="全屏">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onOpenSettings} title="设置">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
