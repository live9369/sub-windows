import * as React from 'react'
import { Save, Bot, Hash, Globe, Timer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { AppSettings } from '@/types'

export interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSave: (next: AppSettings) => void
}

const FieldRow: React.FC<{
  icon: React.ReactNode
  label: string
  hint?: string
  children: React.ReactNode
}> = ({ icon, label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
        <span className="text-zinc-500">{icon}</span>
        {label}
      </label>
      {hint && <span className="text-[10px] text-zinc-500">{hint}</span>}
    </div>
    {children}
  </div>
)

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  settings,
  onSave,
}) => {
  const [draft, setDraft] = React.useState<AppSettings>(settings)

  React.useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>应用设置</DialogTitle>
            <Badge variant="amber">PHASE 1 · 未连接</Badge>
          </div>
          <DialogDescription>
            Phase 1 仅保存表单字段；Phase 2 接入 Telegram Bot + DexScreener 实时数据。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FieldRow
            icon={<Bot className="w-3.5 h-3.5" />}
            label="Telegram Bot Token"
            hint="https://t.me/BotFather 获取"
          >
            <Input
              type="password"
              placeholder="123456:ABC-DEF…"
              value={draft.telegramBotToken}
              onChange={(e) => update('telegramBotToken', e.target.value)}
            />
          </FieldRow>

          <FieldRow
            icon={<Hash className="w-3.5 h-3.5" />}
            label="监听的群 ID"
            hint="逗号分隔，支持 -100xxxxxxxxxx 或 @username"
          >
            <Input
              placeholder="-1001234567890, @alpha_calls, …"
              value={draft.groupIds}
              onChange={(e) => update('groupIds', e.target.value)}
            />
          </FieldRow>

          <FieldRow
            icon={<Globe className="w-3.5 h-3.5" />}
            label="DexScreener API"
            hint="留空使用默认"
          >
            <Input
              placeholder="https://api.dexscreener.com/latest/dex"
              value={draft.dexscreenerEndpoint}
              onChange={(e) => update('dexscreenerEndpoint', e.target.value)}
            />
          </FieldRow>

          <FieldRow
            icon={<Timer className="w-3.5 h-3.5" />}
            label="刷新间隔（秒）"
            hint="信息流轮询周期"
          >
            <Input
              type="number"
              min={5}
              max={600}
              value={draft.refreshIntervalSec}
              onChange={(e) =>
                update('refreshIntervalSec', Number(e.target.value) || 30)
              }
            />
          </FieldRow>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="neon" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
