import * as React from 'react'
import {
  Save,
  Bot,
  Hash,
  Globe,
  Timer,
  MessageCircle,
  Server,
  Loader2,
  Plug,
  User,
  KeyRound,
  Smartphone,
  Send,
  Shield,
  Newspaper,
  Wifi,
  Coins,
  Database,
  CircleDot,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { AppSettings } from '@/types'
import { useSectionNavigation } from '@/hooks/useSectionNavigation'
import { isWebRuntime } from '@/lib/runtimeBridge'

export interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSave: (next: AppSettings) => void
}

type SettingsSectionId =
  | 'general'
  | 'telegram'
  | 'wechat'
  | 'binance'
  | 'twitter'
  | 'blockbeats'
  | 'gmgn'

const SETTINGS_SECTIONS: { id: SettingsSectionId; label: string; hint: string }[] = [
  { id: 'general', label: '通用参数', hint: 'Bot 接入' },
  { id: 'telegram', label: 'Telegram', hint: 'MTProto 登录' },
  { id: 'wechat', label: '微信监控', hint: '本地敏感链路' },
  { id: 'binance', label: '币安广场', hint: '手动 curl 抓取' },
  { id: 'twitter', label: 'X / Twitter', hint: 'WSS 推送' },
  { id: 'blockbeats', label: 'BlockBeats', hint: '新闻 RSS' },
  { id: 'gmgn', label: 'GMGN', hint: 'Token 扩展信息' },
]

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

const DataSourceCard: React.FC<{
  title: string
  subtitle: string
  source: string
  statusLabel: string
  statusVariant?: 'neon' | 'amber' | 'red' | 'muted' | 'cyan'
  children: React.ReactNode
}> = ({ title, subtitle, source, statusLabel, statusVariant = 'muted', children }) => (
  <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-zinc-500" />
          <h3 className="text-xs font-semibold text-zinc-200">{title}</h3>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">{subtitle}</p>
      </div>
      <Badge variant={statusVariant}>{statusLabel}</Badge>
    </div>
    <div className="mb-3 rounded-lg border border-zinc-800 bg-black/20 px-2.5 py-2 text-[11px] text-zinc-400">
      <span className="text-zinc-500 mr-1">数据源来源:</span>
      {source}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
)

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  settings,
  onSave,
}) => {
  const [draft, setDraft] = React.useState<AppSettings>(settings)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [starting, setStarting] = React.useState(false)
  const [startError, setStartError] = React.useState<string | null>(null)
  const [startSuccess, setStartSuccess] = React.useState<string | null>(null)

  // Telegram user client state
  const [tgConnecting, setTgConnecting] = React.useState(false)
  const [tgStatus, setTgStatus] = React.useState<string>('idle')
  const [tgError, setTgError] = React.useState<string | null>(null)
  const [tgNeedCode, setTgNeedCode] = React.useState(false)
  const [tgNeedPassword, setTgNeedPassword] = React.useState(false)
  const [tgCode, setTgCode] = React.useState('')
  const [tgPassword, setTgPassword] = React.useState('')

  const sectionIds = React.useMemo(
    () => SETTINGS_SECTIONS.map((section) => section.id) as SettingsSectionId[],
    [],
  )
  const { activeSection, jumpToSection } = useSectionNavigation<SettingsSectionId>({
    open,
    rootRef: contentRef,
    sections: sectionIds,
    initialSection: 'general',
    resolveElementId: (section) => `settings-${section}`,
  })

  React.useEffect(() => {
    if (open) {
      setDraft(settings)
      setStartError(null)
      setStartSuccess(null)
    }
  }, [open, settings])

  React.useEffect(() => {
    if (!open) return
    setStartError(null)
    setStartSuccess(null)
  }, [draft.wechatBaseUrl, draft.wechatPollIntervalMs, open])

  React.useEffect(() => {
    if (!open) return
    const syncTgState = (state: string, error?: string) => {
      setTgStatus(state)
      setTgNeedCode(state === 'waiting_code')
      setTgNeedPassword(state === 'waiting_password')
      if (error) setTgError(error)
    }

    window.cssApi!.telegramStatus()
      .then((state) => syncTgState(state.state, state.error))
      .catch(() => {})

    const unsubStatus = window.cssApi!.onTelegramStatusChange((state) => {
      syncTgState(state.state, state.error)
    })
    const unsubNeedCode = window.cssApi!.onTelegramNeedCode(() => {
      syncTgState('waiting_code')
    })
    const unsubNeedPassword = window.cssApi!.onTelegramNeedPassword(() => {
      syncTgState('waiting_password')
    })

    return () => {
      unsubStatus()
      unsubNeedCode()
      unsubNeedPassword()
    }
  }, [open])

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
  }

  const handleTestConnection = async () => {
    setStarting(true)
    setStartError(null)
    setStartSuccess(null)
    try {
      await window.cssApi!.wechatStart({
        baseUrl: draft.wechatBaseUrl || 'http://localhost:5678',
        pollIntervalMs: Number(draft.wechatPollIntervalMs) || 3000,
      })
      setStartSuccess('连接成功：当前地址可用。')
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

  const tgStatusMap: Record<string, { label: string; variant: 'neon' | 'amber' | 'red' | 'muted' | 'cyan' }> = {
    connected: { label: '已连接', variant: 'neon' },
    connecting: { label: '连接中', variant: 'cyan' },
    waiting_code: { label: '等待验证码', variant: 'amber' },
    waiting_password: { label: '等待密码', variant: 'amber' },
    error: { label: '连接异常', variant: 'red' },
    idle: { label: '未连接', variant: 'muted' },
  }
  const tgStatusUi = tgStatusMap[tgStatus] || tgStatusMap.idle

  const wxStatusUi = startError
    ? { label: '连接异常', variant: 'red' as const }
    : starting
      ? { label: '测试中', variant: 'cyan' as const }
      : startSuccess
        ? { label: '连接正常', variant: 'neon' as const }
      : draft.wechatEnabled
        ? { label: '已启用', variant: 'amber' as const }
        : { label: '未启用', variant: 'muted' as const }

  const twitterStatusUi = draft.twitterWsEnabled
    ? draft.twitterWsUrl && draft.twitterWsToken
      ? { label: '已配置', variant: 'amber' as const }
      : { label: '待补全', variant: 'red' as const }
    : { label: '未启用', variant: 'muted' as const }

  const blockbeatsStatusUi = draft.blockbeatsEnabled
    ? draft.blockbeatsApiKey
      ? { label: '已配置', variant: 'amber' as const }
      : { label: '待补全', variant: 'red' as const }
    : { label: '未启用', variant: 'muted' as const }

  const binanceStatusUi = draft.binanceSquareEnabled
    ? draft.binanceSquareCurl.trim()
      ? { label: '已配置', variant: 'amber' as const }
      : { label: '待补全', variant: 'red' as const }
    : { label: '未启用', variant: 'muted' as const }

  const webRuntime = isWebRuntime()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(1200px,96vw)] h-[min(860px,calc(100vh-2rem))] flex flex-col"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-10">
            <div className="flex items-center gap-2">
              <DialogTitle>数据源设置</DialogTitle>
              <Badge variant="cyan">自备数据源</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button variant="neon" onClick={handleSave}>
                <Save className="w-3.5 h-3.5" />
                保存
              </Button>
            </div>
          </div>
          <DialogDescription>
            本产品是前端展示框架，不包含任何共享数据。请在下方填写你自己的服务地址、Token 与鉴权信息。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
          <aside className="col-span-4 md:col-span-3 h-full overflow-hidden pr-1">
            <div className="space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-2">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'hover:bg-zinc-800/70 border border-transparent'
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-200">{section.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{section.hint}</div>
                </button>
              ))}
            </div>
          </aside>

          <div ref={contentRef} className="col-span-8 md:col-span-9 h-full space-y-4 overflow-y-auto pr-1">
            <div id="settings-general">
          <DataSourceCard
            title="通用参数"
            subtitle="Telegram Bot 推送接入（实时流，非轮询）。"
            source="你的 Bot 推送服务（WS/SSE）"
            statusLabel={draft.telegramBotPushUrl ? '已配置' : '未配置'}
            statusVariant={draft.telegramBotPushUrl ? 'amber' : 'muted'}
          >
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-2.5 py-2 text-[11px] text-zinc-400">
              当前模式不直接轮询 Telegram。请由你的 Bot 服务推送消息到下方地址（WS 或 SSE）。
            </div>
            <FieldRow
              icon={<Globe className="w-3.5 h-3.5" />}
              label="Bot 推送地址"
              hint="ws(s):// 或 http(s)://（SSE）"
            >
              <Input
                placeholder="wss://your-bot-relay/ws"
                value={draft.telegramBotPushUrl}
                onChange={(e) => update('telegramBotPushUrl', e.target.value)}
              />
            </FieldRow>
            <FieldRow
              icon={<Bot className="w-3.5 h-3.5" />}
              label="Bot Token / 推送鉴权"
              hint="传给你的推送服务用于鉴权"
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
              label="监听的群 ID（可选）"
              hint="留空=自动发现；支持 -100... / @username / -100...#topicId"
            >
              <Input
                placeholder="留空自动发现；或 -1001234567890#42, @alpha_calls#7"
                value={draft.groupIds}
                onChange={(e) => update('groupIds', e.target.value)}
              />
            </FieldRow>
          </DataSourceCard>
            </div>

            <div id="settings-telegram">
          <DataSourceCard
            title="Telegram 用户客户端"
            subtitle="使用你自己的 Telegram 账号登录，获取实时群消息。"
            source="Telegram MTProto（my.telegram.org 的 API ID / Hash）"
            statusLabel={tgStatusUi.label}
            statusVariant={tgStatusUi.variant}
          >
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <CircleDot className="w-3 h-3" />
              接入步骤：连接 → 登录 → 验证码/2FA（如需要）→ 状态变为 connected
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
            </div>
          </DataSourceCard>
            </div>

            <div id="settings-wechat">
          <DataSourceCard
            title="微信监控（可用链路）"
            subtitle={
              webRuntime
                ? 'Web 版已支持：浏览器直连本机 wechat-decrypt（开发模式经 Vite 代理）。'
                : '桌面版已可用：连接你手动启动的本机 wechat-decrypt 服务。'
            }
            source="本机 wechat-decrypt HTTP API（例如 http://localhost:5678）"
            statusLabel={wxStatusUi.label}
            statusVariant={wxStatusUi.variant}
          >
            <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-200">
              {webRuntime
                ? 'Web 本地开发：请先启动 wechat-decrypt，服务地址保持 http://localhost:5678；前端会通过 /__wechat 代理避免 CORS。'
                : '微信链路涉及本地解密与隐私数据，建议仅在本机运行服务并通过 localhost 接入。'}
            </div>

            <FieldRow
              icon={<MessageCircle className="w-3.5 h-3.5" />}
              label="启用微信监控"
              hint={webRuntime ? '开启后浏览器轮询本机服务' : '开启后主进程连接你已手动启动的服务'}
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
              hint="wechat-decrypt HTTP API（需你手动启动）"
            >
              <Input
                placeholder="http://localhost:5678"
                value={draft.wechatBaseUrl}
                onChange={(e) => update('wechatBaseUrl', e.target.value)}
              />
            </FieldRow>

            <FieldRow
              icon={<Timer className="w-3.5 h-3.5" />}
              label="轮询间隔（毫秒）"
              hint={webRuntime ? '浏览器轮询 /api/history 频率' : '主进程轮询 /api/history 频率'}
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
                disabled={starting}
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
              {startSuccess && (
                <p className="mt-1.5 text-[11px] text-emerald-400">{startSuccess}</p>
              )}
            </div>
          </DataSourceCard>
            </div>

            <div id="settings-binance">
          <DataSourceCard
            title="币安广场（推文源）"
            subtitle="该数据源不是币安公开行情接口。可直接粘贴浏览器抓到的 curl 请求。"
            source="你手动获取的 Binance Square 请求（curl）"
            statusLabel={binanceStatusUi.label}
            statusVariant={binanceStatusUi.variant}
          >
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              建议直接粘贴完整 curl（包含 header / cookie / data-raw），主进程会按原样执行。
            </div>
            <FieldRow
              icon={<Wifi className="w-3.5 h-3.5" />}
              label="启用币安广场拉取"
              hint="轮询获取最新广场内容"
            >
              <div className="flex items-center h-8">
                <Switch
                  checked={draft.binanceSquareEnabled}
                  onCheckedChange={(v) => update('binanceSquareEnabled', v)}
                />
              </div>
            </FieldRow>
            <FieldRow
              icon={<Server className="w-3.5 h-3.5" />}
              label="curl 请求"
              hint="可多行粘贴"
            >
              <textarea
                className="w-full min-h-[140px] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="curl 'https://www.binance.com/bapi/...'"
                value={draft.binanceSquareCurl}
                onChange={(e) => update('binanceSquareCurl', e.target.value)}
              />
            </FieldRow>
          </DataSourceCard>
            </div>

            <div id="settings-twitter">
          <DataSourceCard
            title="X / Twitter 实时流"
            subtitle="接入自建 WSS 推送服务，前端仅消费流数据。"
            source="你的自建 Twitter 监控后端（WSS + Token）"
            statusLabel={twitterStatusUi.label}
            statusVariant={twitterStatusUi.variant}
          >
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
          </DataSourceCard>
            </div>

            <div id="settings-blockbeats">
          <DataSourceCard
            title="BlockBeats 新闻"
            subtitle="新闻流接口，按固定间隔抓取并解析 RSS。"
            source="api-pro.theblockbeats.info（需要 API Key）"
            statusLabel={blockbeatsStatusUi.label}
            statusVariant={blockbeatsStatusUi.variant}
          >
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
          </DataSourceCard>
            </div>

            <div id="settings-gmgn">
          <DataSourceCard
            title="GMGN Token 卡片"
            subtitle="用于 token hover 卡片的补充行情信息。"
            source="GMGN API（可选，缺省时相关扩展信息不可用）"
            statusLabel={draft.gmgnApiKey ? '已配置' : '未配置'}
            statusVariant={draft.gmgnApiKey ? 'amber' : 'muted'}
          >
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
          </DataSourceCard>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
