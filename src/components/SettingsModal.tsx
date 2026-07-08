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
  User,
  KeyRound,
  Smartphone,
  Send,
  Shield,
  Newspaper,
  Wifi,
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

  // Telegram user client state
  const [tgConnecting, setTgConnecting] = React.useState(false)
  const [tgStatus, setTgStatus] = React.useState<string>('idle')
  const [tgError, setTgError] = React.useState<string | null>(null)
  const [tgNeedCode, setTgNeedCode] = React.useState(false)
  const [tgNeedPassword, setTgNeedPassword] = React.useState(false)
  const [tgCode, setTgCode] = React.useState('')
  const [tgPassword, setTgPassword] = React.useState('')

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

  const handleTgConnect = async () => {
    setTgConnecting(true)
    setTgError(null)
    try {
      const state = await window.cssApi!.telegramConnect(Number(draft.telegramApiId) || 0, draft.telegramApiHash)
      setTgStatus(state.state)
      if (state.state === 'connected') {
        setTgNeedCode(false)
        setTgNeedPassword(false)
      } else if (state.error) {
        setTgError(state.error)
      }
    } catch (err: any) {
      setTgError(err?.message || '连接失败')
    } finally {
      setTgConnecting(false)
    }
  }

  const handleTgLogin = async () => {
    setTgConnecting(true)
    setTgError(null)
    try {
      const state = await window.cssApi!.telegramLogin(draft.telegramPhone)
      setTgStatus(state.state)
      if (state.error) setTgError(state.error)
    } catch (err: any) {
      setTgError(err?.message || '登录失败')
    } finally {
      setTgConnecting(false)
    }
  }

  const handleTgSubmitCode = async () => {
    if (!tgCode) return
    setTgConnecting(true)
    try {
      const state = await window.cssApi!.telegramSubmitCode(tgCode)
      setTgStatus(state.state)
      setTgNeedCode(false)
      setTgCode('')
      if (state.error) setTgError(state.error)
    } catch (err: any) {
      setTgError(err?.message || '提交失败')
    } finally {
      setTgConnecting(false)
    }
  }

  const handleTgSubmitPassword = async () => {
    if (!tgPassword) return
    setTgConnecting(true)
    try {
      const state = await window.cssApi!.telegramSubmitPassword(tgPassword)
      setTgStatus(state.state)
      setTgNeedPassword(false)
      setTgPassword('')
      if (state.error) setTgError(state.error)
    } catch (err: any) {
      setTgError(err?.message || '提交失败')
    } finally {
      setTgConnecting(false)
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

          {/* Telegram User Client (Phase 4) */}
          <div className="border-t border-zinc-800 pt-3 mt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Telegram 用户客户端（Phase 4）
            </div>

            <FieldRow
              icon={<KeyRound className="w-3.5 h-3.5" />}
              label="API ID"
              hint="https://my.telegram.org/apps"
            >
              <Input
                type="number"
                placeholder="123456"
                value={draft.telegramApiId || ''}
                onChange={(e) => update('telegramApiId', Number(e.target.value) || 0)}
              />
            </FieldRow>

            <FieldRow
              icon={<Shield className="w-3.5 h-3.5" />}
              label="API Hash"
              hint="my.telegram.org 获取"
            >
              <Input
                type="password"
                placeholder="abc123def..."
                value={draft.telegramApiHash}
                onChange={(e) => update('telegramApiHash', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<Smartphone className="w-3.5 h-3.5" />}
              label="手机号"
              hint="+86 格式"
            >
              <Input
                placeholder="+86138xxxxxxxx"
                value={draft.telegramPhone}
                onChange={(e) => update('telegramPhone', e.target.value)}
              />
            </FieldRow>

            {tgNeedCode && (
              <FieldRow
                icon={<Send className="w-3.5 h-3.5" />}
                label="验证码"
                hint="Telegram 已发送"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="12345"
                    value={tgCode}
                    onChange={(e) => setTgCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={!tgCode || tgConnecting}
                    onClick={handleTgSubmitCode}
                  >
                    {tgConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '提交'}
                  </Button>
                </div>
              </FieldRow>
            )}

            {tgNeedPassword && (
              <FieldRow
                icon={<Shield className="w-3.5 h-3.5" />}
                label="两步验证密码"
                hint="2FA"
              >
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={tgPassword}
                    onChange={(e) => setTgPassword(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    disabled={!tgPassword || tgConnecting}
                    onClick={handleTgSubmitPassword}
                  >
                    {tgConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '提交'}
                  </Button>
                </div>
              </FieldRow>
            )}

            <div className="pt-1">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!draft.telegramApiId || !draft.telegramApiHash || tgConnecting}
                  onClick={handleTgConnect}
                >
                  {tgConnecting ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Plug className="w-3.5 h-3.5 mr-1" />
                  )}
                  {tgConnecting ? '连接中…' : '连接'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!draft.telegramPhone || tgConnecting}
                  onClick={handleTgLogin}
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  登录
                </Button>
              </div>
              {tgError && (
                <p className="mt-1.5 text-[11px] text-rose-400">{tgError}</p>
              )}
              {tgStatus && tgStatus !== 'idle' && !tgError && (
                <p className="mt-1.5 text-[11px] text-emerald-400">
                  状态: {tgStatus}
                </p>
              )}
            </div>
          </div>

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

          {/* BlockBeats News */}
          <div className="border-t border-zinc-800 pt-3 mt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              BlockBeats 新闻
            </div>

            <FieldRow
              icon={<Newspaper className="w-3.5 h-3.5" />}
              label="启用新闻监控"
              hint="主进程 SSR 拉取 RSS"
            >
              <div className="flex items-center h-8">
                <Switch
                  checked={draft.blockbeatsEnabled}
                  onCheckedChange={(v) => update('blockbeatsEnabled', v)}
                />
              </div>
            </FieldRow>

            <FieldRow
              icon={<Shield className="w-3.5 h-3.5" />}
              label="API Key"
              hint="theblockbeats.info/apiDoc"
            >
              <Input
                type="password"
                placeholder="api-pro.theblockbeats.info"
                value={draft.blockbeatsApiKey}
                onChange={(e) => update('blockbeatsApiKey', e.target.value)}
              />
            </FieldRow>
          </div>

          {/* GMGN */}
          <div className="border-t border-zinc-800 pt-3 mt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              GMGN Token 卡片
            </div>

            <FieldRow
              icon={<KeyRound className="w-3.5 h-3.5" />}
              label="API Key"
              hint="gmgn.ai/ai"
            >
              <Input
                type="password"
                placeholder="GMGN API Key"
                value={draft.gmgnApiKey}
                onChange={(e) => update('gmgnApiKey', e.target.value)}
              />
            </FieldRow>
          </div>

          {/* Twitter WSS Stream */}
          <div className="border-t border-zinc-800 pt-3 mt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              X / Twitter WSS 实时流
            </div>

            <FieldRow
              icon={<Wifi className="w-3.5 h-3.5" />}
              label="启用 WSS 推送"
              hint="自建 Twitter 监控服务"
            >
              <div className="flex items-center h-8">
                <Switch
                  checked={draft.twitterWsEnabled}
                  onCheckedChange={(v) => update('twitterWsEnabled', v)}
                />
              </div>
            </FieldRow>

            <FieldRow
              icon={<Globe className="w-3.5 h-3.5" />}
              label="WSS 地址"
              hint="wss://your-domain.com/ws"
            >
              <Input
                placeholder="wss://your-domain.com/ws"
                value={draft.twitterWsUrl}
                onChange={(e) => update('twitterWsUrl', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<Shield className="w-3.5 h-3.5" />}
              label="Token"
              hint="WebSocket 鉴权令牌"
            >
              <Input
                type="password"
                placeholder="your-ws-token"
                value={draft.twitterWsToken}
                onChange={(e) => update('twitterWsToken', e.target.value)}
              />
            </FieldRow>
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
