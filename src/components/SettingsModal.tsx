import * as React from 'react'
import {
  Save,
  Bot,
  Hash,
  Globe,
  Timer,
  MessageCircle,
  Server,
  Terminal,
  FileCode,
  Loader2,
  Plug,
} from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
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
  const [starting, setStarting] = React.useState(false)
  const [startError, setStartError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setDraft(settings)
      setStartError(null)
    }
  }, [open, settings])

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
  }

  const handleTestConnection = async () => {
    setStarting(true)
    setStartError(null)
    try {
      await window.cssApi!.wechatStart({
        baseUrl: draft.wechatBaseUrl || 'http://localhost:5678',
        pollIntervalMs: Number(draft.wechatPollIntervalMs) || 3000,
      })
    } catch (err: any) {
      setStartError(err?.message || '连接失败')
    } finally {
      setStarting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>应用设置</DialogTitle>
            <Badge variant="amber">PHASE 2 · WECHAT</Badge>
          </div>
          <DialogDescription>
            配置 Telegram Bot 与微信解密服务参数，保存后自动持久化。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Telegram */}
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pt-1">
            Telegram（Phase 2）
          </div>

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

          {/* WeChat */}
          <div className="border-t border-zinc-800 pt-3 mt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              微信监控
            </div>

            <FieldRow
              icon={<MessageCircle className="w-3.5 h-3.5" />}
              label="启用微信监控"
              hint="开启后主进程自动连接 localhost:5678"
            >
              <div className="flex items-center h-8">
                <Switch
                  checked={draft.wechatEnabled}
                  onCheckedChange={(v) => update('wechatEnabled', v)}
                />
              </div>
            </FieldRow>

            <FieldRow
              icon={<Server className="w-3.5 h-3.5" />}
              label="服务地址"
              hint="wechat-decrypt HTTP API"
            >
              <Input
                placeholder="http://localhost:5678"
                value={draft.wechatBaseUrl}
                onChange={(e) => update('wechatBaseUrl', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<Terminal className="w-3.5 h-3.5" />}
              label="Python 路径"
              hint="系统 python / python3 或绝对路径"
            >
              <Input
                placeholder={window.cssApi?.platform === 'win32' ? 'python' : 'python3'}
                value={draft.wechatPythonPath}
                onChange={(e) => update('wechatPythonPath', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<FileCode className="w-3.5 h-3.5" />}
              label="脚本路径"
              hint="wechat-decrypt/main.py"
            >
              <Input
                placeholder="vendor/wechat-decrypt/main.py"
                value={draft.wechatScriptPath}
                onChange={(e) => update('wechatScriptPath', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<Timer className="w-3.5 h-3.5" />}
              label="轮询间隔（毫秒）"
              hint="主进程轮询 /api/history 频率"
            >
              <Input
                type="number"
                min={500}
                max={30000}
                value={draft.wechatPollIntervalMs}
                onChange={(e) =>
                  update('wechatPollIntervalMs', Number(e.target.value) || 3000)
                }
              />
            </FieldRow>

            <div className="pt-1">
              <Button
                variant="outline"
                className="w-full"
                disabled={!draft.wechatEnabled || starting}
                onClick={handleTestConnection}
              >
                {starting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Plug className="w-3.5 h-3.5 mr-1" />
                )}
                {starting ? '测试中…' : '测试连接'}
              </Button>
              {startError && (
                <p className="mt-1.5 text-[11px] text-rose-400">{startError}</p>
              )}
            </div>
          </div>
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
