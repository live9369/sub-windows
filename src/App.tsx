import * as React from 'react'
import { Plus, X } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { SplitPane } from '@/components/SplitPane'
import { LeftPanel } from '@/components/LeftPanel'
import { RightPanel } from '@/components/RightPanel'
import { SettingsModal } from '@/components/SettingsModal'
import { DataIntegrationGuideModal } from '@/components/DataIntegrationGuideModal'
import { useWechatMessages } from '@/hooks/useWechatMessages'
import { useBinancePrices } from '@/hooks/useBinancePrices'
import { useBlockbeatsNews } from '@/hooks/useBlockbeatsNews'
import { useTwitterStream } from '@/hooks/useTwitterStream'
import { useBinanceSquareFeed } from './hooks/useBinanceSquareFeed'
import { useTelegramMessages } from '@/hooks/useTelegramMessages'
import { useTelegramBotPush } from '@/hooks/useTelegramBotPush'
import {
  DEFAULT_TOKEN_PRESETS,
  parseTokenPresets,
  serializeTokenPresets,
  type TokenPreset,
} from '@/data/tokenPresets'
import { MOCK_FEED, MOCK_GROUPS, MOCK_MESSAGES } from '@/data/mockData'
import type { AppSettings } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  telegramBotToken: '',
  groupIds: '',
  telegramBotPushUrl: '',
  wechatEnabled: false,
  wechatBaseUrl: 'http://localhost:5678',
  wechatPollIntervalMs: 3000,
  telegramApiId: 0,
  telegramApiHash: '',
  telegramPhone: '',
  tokenPresets: '',
  blockbeatsEnabled: false,
  blockbeatsApiKey: '',
  binanceSquareEnabled: false,
  binanceSquareCurl: '',
  gmgnApiKey: '',
  twitterWsEnabled: false,
  twitterWsUrl: '',
  twitterWsToken: '',
}

function formatPrice(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toPrecision(4)}`
}

export default function App() {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [guideOpen, setGuideOpen] = React.useState(false)
  const [globalQuery, setGlobalQuery] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)
  const [refreshTick, setRefreshTick] = React.useState(0)

  const tokenPresets = React.useMemo(
    () => {
      const parsed = parseTokenPresets(settings.tokenPresets)
      return parsed.length > 0 ? parsed : DEFAULT_TOKEN_PRESETS
    },
    [settings.tokenPresets],
  )

  const binance = useBinancePrices(tokenPresets, 10000)

  const blockbeats = useBlockbeatsNews({
    enabled: settings.blockbeatsEnabled,
    apiKey: settings.blockbeatsApiKey,
    page: 1,
    size: 20,
    intervalMs: 30000,
  })

  const twitter = useTwitterStream({
    enabled: settings.twitterWsEnabled,
    wsUrl: settings.twitterWsUrl,
    token: settings.twitterWsToken,
  })

  const binanceSquare = useBinanceSquareFeed({
    enabled: settings.binanceSquareEnabled,
    curlCommand: settings.binanceSquareCurl,
    intervalMs: 30000,
  })

  const wechat = useWechatMessages({
    enabled: settings.wechatEnabled,
    baseUrl: settings.wechatBaseUrl,
    pollIntervalMs: settings.wechatPollIntervalMs,
  })

  const telegram = useTelegramMessages({
    enabled: Boolean(settings.telegramApiId && settings.telegramApiHash),
    apiId: settings.telegramApiId,
    apiHash: settings.telegramApiHash,
    phone: settings.telegramPhone,
  })

  const telegramBot = useTelegramBotPush({
    enabled: Boolean(settings.telegramBotPushUrl?.trim()),
    pushUrl: settings.telegramBotPushUrl,
    token: settings.telegramBotToken,
    groupIds: settings.groupIds,
  })

  const leftGroups = React.useMemo(
    () => [...wechat.discoveredGroups, ...telegram.discoveredGroups, ...telegramBot.discoveredGroups],
    [wechat.discoveredGroups, telegram.discoveredGroups, telegramBot.discoveredGroups],
  )

  const leftMessagesByGroup = React.useMemo(
    () => ({ ...wechat.messagesByGroup, ...telegram.messagesByGroup, ...telegramBot.messagesByGroup }),
    [wechat.messagesByGroup, telegram.messagesByGroup, telegramBot.messagesByGroup],
  )

  // Load persisted settings on mount
  React.useEffect(() => {
    window.cssApi!.loadSettings().then((saved: unknown) => {
      if (saved && typeof saved === 'object') {
        setSettings((prev) => ({ ...prev, ...(saved as Partial<AppSettings>) }))
      }
    }).catch(() => {})
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshTick((n) => n + 1)
    if (settings.wechatEnabled) {
      void wechat.refreshGroups()
    }
    void binance.refresh()
    void binanceSquare.refresh()
    void blockbeats.refresh()
    window.setTimeout(() => setRefreshing(false), 700)
  }

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next)
    window.cssApi!.saveSettings(next).catch(() => {})
  }

  const updateTokenPresets = (next: TokenPreset[]) => {
    const updated = { ...settings, tokenPresets: serializeTokenPresets(next) }
    handleSaveSettings(updated)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <TopBar
        globalQuery={globalQuery}
        onGlobalQueryChange={setGlobalQuery}
        onRefresh={handleRefresh}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        refreshing={refreshing}
      />

      <main className="flex-1 min-h-0 grid-bg">
        <SplitPane
          defaultLeftRatio={0.65}
          left={
            <LeftPanel
              globalQuery={globalQuery}
              refreshTick={refreshTick}
              wxGroups={leftGroups}
              wxMessagesByGroup={leftMessagesByGroup}
              wxStatus={wechat.status}
              wxError={wechat.error}
              onRetryWechat={wechat.retry}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          }
          right={
            <RightPanel
              globalQuery={globalQuery}
              refreshTick={refreshTick}
              newsItems={blockbeats.items}
              binanceItems={binanceSquare.items}
              binanceStatus={binanceSquare.status}
              binanceError={binanceSquare.error}
              twitterItems={twitter.items}
              twitterStatus={twitter.status}
            />
          }
        />
      </main>

      <StatusBar
        refreshing={refreshing}
        prices={binance.prices}
        tokenPresets={tokenPresets}
        onUpdateTokenPresets={updateTokenPresets}
      />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
      />
      <DataIntegrationGuideModal
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </div>
  )
}

const MAX_TOKENS = 10

const StatusBar: React.FC<{
  refreshing: boolean
  prices: { label: string; price: number }[]
  tokenPresets: TokenPreset[]
  onUpdateTokenPresets: (next: TokenPreset[]) => void
}> = ({ refreshing, prices, tokenPresets, onUpdateTokenPresets }) => {
  const [adding, setAdding] = React.useState(false)
  const [newSymbol, setNewSymbol] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')
  const atLimit = tokenPresets.length >= MAX_TOKENS

  const handleAdd = () => {
    if (atLimit) return
    const symbol = newSymbol.trim().toUpperCase()
    const label = newLabel.trim().toUpperCase() || symbol.replace(/USDT$/, '')
    if (!symbol) return
    if (tokenPresets.some((t) => t.symbol === symbol)) return
    onUpdateTokenPresets([...tokenPresets, { symbol, label }])
    setNewSymbol('')
    setNewLabel('')
    setAdding(false)
  }

  const handleRemove = (symbol: string) => {
    onUpdateTokenPresets(tokenPresets.filter((t) => t.symbol !== symbol))
  }

  return (
    <footer className="flex items-center justify-between h-7 px-3 text-[10px] font-mono text-zinc-500 border-t border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {refreshing ? 'SYNCING' : 'READY'}
        </span>
        <span>
          {MOCK_GROUPS.length} GROUPS · {MOCK_MESSAGES.length} MSGS · {MOCK_FEED.length} FEED ITEMS
        </span>
      </div>
      <div className="flex items-center gap-2">
        {prices.length > 0 ? (
          prices.map((p) => (
            <span
              key={p.label}
              className="group relative flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/60 transition-colors cursor-default"
            >
              {p.label} <span className="text-emerald-400">{formatPrice(p.price)}</span>
              <button
                onClick={() => handleRemove(p.label)}
                className="hidden group-hover:inline-flex text-zinc-600 hover:text-rose-400 transition-colors ml-0.5"
                title="删除"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-zinc-600">价格加载中…</span>
        )}

        {adding ? (
          <span className="flex items-center gap-1 ml-1">
            <input
              type="text"
              placeholder="BNBUSDT"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              className="w-20 h-5 px-1 text-[10px] font-mono bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="BNB"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              className="w-12 h-5 px-1 text-[10px] font-mono bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
            <button
              onClick={handleAdd}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </span>
        ) : (
          <button
            onClick={() => !atLimit && setAdding(true)}
            disabled={atLimit}
            className="flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 text-zinc-600 hover:text-emerald-400 transition-colors disabled:text-zinc-700 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            title={atLimit ? `最多 ${MAX_TOKENS} 个 Token` : '添加 Token'}
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </footer>
  )
}
