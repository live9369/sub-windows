import * as React from 'react'
import { TopBar } from '@/components/TopBar'
import { SplitPane } from '@/components/SplitPane'
import { LeftPanel } from '@/components/LeftPanel'
import { RightPanel } from '@/components/RightPanel'
import { SettingsModal } from '@/components/SettingsModal'
import { MOCK_FEED, MOCK_GROUPS, MOCK_MESSAGES } from '@/data/mockData'
import type { AppSettings } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  telegramBotToken: '',
  groupIds: '',
  dexscreenerEndpoint: '',
  refreshIntervalSec: 30,
}

export default function App() {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [globalQuery, setGlobalQuery] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)
  const [refreshTick, setRefreshTick] = React.useState(0)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshTick((n) => n + 1)
    window.setTimeout(() => setRefreshing(false), 700)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <TopBar
        globalQuery={globalQuery}
        onGlobalQueryChange={setGlobalQuery}
        onRefresh={handleRefresh}
        onOpenSettings={() => setSettingsOpen(true)}
        refreshing={refreshing}
      />

      <main className="flex-1 min-h-0 grid-bg">
        <SplitPane
          defaultLeftRatio={0.65}
          left={
            <LeftPanel
              globalQuery={globalQuery}
              refreshTick={refreshTick}
            />
          }
          right={
            <RightPanel
              globalQuery={globalQuery}
              refreshTick={refreshTick}
            />
          }
        />
      </main>

      <StatusBar refreshing={refreshing} />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  )
}

const StatusBar: React.FC<{ refreshing: boolean }> = ({ refreshing }) => (
  <footer className="flex items-center justify-between h-7 px-3 text-[10px] font-mono text-zinc-500 border-t border-zinc-800 bg-zinc-950 shrink-0">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
        {refreshing ? 'SYNCING' : 'READY'}
      </span>
      <span>MOCK DATA</span>
      <span>
        {MOCK_GROUPS.length} GROUPS · {MOCK_MESSAGES.length} MSGS · {MOCK_FEED.length} FEED ITEMS
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span>BTC <span className="text-emerald-400">$98,124</span></span>
      <span>ETH <span className="text-emerald-400">$4,182</span></span>
      <span>SOL <span className="text-emerald-400">$248.5</span></span>
    </div>
  </footer>
)
