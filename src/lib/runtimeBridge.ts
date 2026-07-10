import type { CssApi, WechatBatch, WechatState } from '@/types/cssApi'
import { fetchBinancePrices } from '@/lib/binanceApi'
import { fetchBlockbeatsRss } from '@/lib/blockbeatsApi'
import { fetchViaParsedCurl } from '@/lib/curlParser'
import { fetchGmgnTokenInfo } from '@/lib/gmgnApi'
import { twitterWebService } from '@/lib/twitterWebService'
import { wechatWebService } from '@/lib/wechatWebService'

const SETTINGS_KEY = 'css-app-settings'

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

function loadWebSettings(): unknown {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveWebSettings(data: unknown): boolean {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function readGmgnApiKey(explicit?: string): string {
  if (explicit?.trim()) return explicit.trim()
  const settings = loadWebSettings() as { gmgnApiKey?: string } | null
  return settings?.gmgnApiKey?.trim() || ''
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
  toggleFullscreen: async () => {
    if (typeof document === 'undefined') return false
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        return true
      }
      await document.exitFullscreen()
      return false
    } catch {
      return false
    }
  },
  platform: detectPlatform(),

  loadSettings: async () => loadWebSettings(),
  saveSettings: async (v: unknown) => saveWebSettings(v),

  wechatStart: async (cfg: unknown) => {
    const c = cfg as { baseUrl?: string; pollIntervalMs?: number }
    await wechatWebService.start({
      baseUrl: c?.baseUrl || 'http://localhost:5678',
      pollIntervalMs: Number(c?.pollIntervalMs) || 3000,
    })
    return { ok: true }
  },
  wechatStop: async () => {
    wechatWebService.stop()
    return null
  },
  wechatStatus: async () => wechatWebService.getState(),
  wechatDiscover: async (baseUrl: string) => wechatWebService.discover(baseUrl),
  onWechatMessage: (cb: (data: WechatBatch) => void) => wechatWebService.onBatch(cb),
  onWechatStatusChange: (cb: (state: WechatState) => void) => wechatWebService.onStatus(cb),

  telegramConnect: () => unsupported('telegramConnect'),
  telegramLogin: () => unsupported('telegramLogin'),
  telegramSubmitCode: () => unsupported('telegramSubmitCode'),
  telegramSubmitPassword: () => unsupported('telegramSubmitPassword'),
  telegramGetDialogs: () => unsupported('telegramGetDialogs'),
  telegramLoadHistory: () => unsupported('telegramLoadHistory'),
  telegramDisconnect: async () => ({ state: 'idle' }),
  telegramStatus: async () => ({
    state: 'idle',
    error: 'Web 端不支持 Telegram 用户客户端（MTProto），请使用 Bot 推送流',
  }),
  onTelegramMessage: () => noopUnsub,
  onTelegramStatusChange: () => noopUnsub,
  onTelegramNeedCode: () => noopUnsub,
  onTelegramNeedPassword: () => noopUnsub,

  binancePrices: async (symbols: string[]) => fetchBinancePrices(symbols),
  blockbeatsFetch: async (apiKey: string, page = 1, size = 20) =>
    fetchBlockbeatsRss(apiKey, page, size),
  binanceSquareFetch: async (curlCommand: string) => fetchViaParsedCurl(curlCommand),

  gmgnTokenInfo: async (chain: string, address: string, apiKey?: string) =>
    fetchGmgnTokenInfo(chain, address, readGmgnApiKey(apiKey)),

  twitterStart: async (cfg: unknown) => {
    const c = cfg as { wsUrl?: string; token?: string }
    await twitterWebService.start({
      wsUrl: c?.wsUrl || '',
      token: c?.token || '',
    })
    return { ok: true }
  },
  twitterStop: async () => {
    twitterWebService.stop()
    return null
  },
  twitterStatus: async () => twitterWebService.getState(),
  onTwitterTweet: (cb) => twitterWebService.onTweet(cb),
  onTwitterStatusChange: (cb) => twitterWebService.onStatus(cb),
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
