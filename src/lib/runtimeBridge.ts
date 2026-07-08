import type { CssApi } from '@/types/cssApi'

const noopUnsub = () => ({} as any)

function detectPlatform(): string {
  if (typeof navigator === 'undefined') return 'linux'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('windows')) return 'win32'
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'darwin'
  return 'linux'
}

function unsupported(method: string): Promise<never> {
  return Promise.reject(
    new Error(`[web] ${method} 仅支持桌面版（Electron 本地桥接）`),
  )
}

const webShim: CssApi = {
  openExternal: async (url: string) => {
    if (typeof window !== 'undefined' && url?.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return true
    }
    return false
  },
  copyText: async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    return false
  },
  toggleFullscreen: async () => false,
  platform: detectPlatform(),

  loadSettings: async () => null,
  saveSettings: async () => true,

  wechatStart: () => unsupported('wechatStart'),
  wechatStop: async () => null,
  wechatStatus: async () => ({ state: 'error', error: 'web 端不支持本地微信桥接' }),
  wechatDiscover: () => unsupported('wechatDiscover'),
  onWechatMessage: () => noopUnsub,
  onWechatStatusChange: () => noopUnsub,

  telegramConnect: () => unsupported('telegramConnect'),
  telegramLogin: () => unsupported('telegramLogin'),
  telegramSubmitCode: () => unsupported('telegramSubmitCode'),
  telegramSubmitPassword: () => unsupported('telegramSubmitPassword'),
  telegramGetDialogs: () => unsupported('telegramGetDialogs'),
  telegramLoadHistory: () => unsupported('telegramLoadHistory'),
  telegramDisconnect: async () => ({ state: 'idle' }),
  telegramStatus: async () => ({ state: 'error', error: 'web 端不支持本地 Telegram 用户客户端' }),
  onTelegramMessage: () => noopUnsub,
  onTelegramStatusChange: () => noopUnsub,
  onTelegramNeedCode: () => noopUnsub,
  onTelegramNeedPassword: () => noopUnsub,

  binancePrices: () => unsupported('binancePrices'),
  blockbeatsFetch: async () => unsupported('blockbeatsFetch'),
  binanceSquareFetch: async () => unsupported('binanceSquareFetch'),

  gmgnTokenInfo: () => unsupported('gmgnTokenInfo'),

  twitterStart: () => unsupported('twitterStart'),
  twitterStop: async () => null,
  twitterStatus: async () => ({ state: 'error', error: 'web 端不支持本地 Twitter WSS 桥接' }),
  onTwitterTweet: () => noopUnsub,
  onTwitterStatusChange: () => noopUnsub,
}

let shimInstalled = false

export function ensureRuntimeBridge() {
  if (typeof window === 'undefined') return
  if (window.cssApi) return
  window.cssApi = webShim
  shimInstalled = true
}

export function isWebRuntime() {
  return shimInstalled
}
