/** Shared wechat-decrypt HTTP helpers (Electron main + Web renderer). */

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/$/, '')
}

function parseWechatUrl(baseUrl: string): URL | null {
  const normalized = normalizeBaseUrl(baseUrl)
  if (!normalized) return null
  try {
    const withScheme = normalized.startsWith('http') ? normalized : `http://${normalized}`
    return new URL(withScheme)
  } catch {
    return null
  }
}

export function isLocalWechatHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function getPageLocation(): { hostname: string; protocol: string } | undefined {
  if (typeof globalThis === 'undefined') return undefined
  const loc = (globalThis as { location?: { hostname: string; protocol: string } }).location
  return loc
}

/** Vite dev/preview on localhost exposes `/__wechat` → localhost:5678. Vercel has no such proxy. */
export function shouldUseWechatDevProxy(): boolean {
  if (import.meta.env.DEV) return true
  const location = getPageLocation()
  if (!location) return false
  return isLocalWechatHost(location.hostname)
}

export function isRemoteWebHost(): boolean {
  const location = getPageLocation()
  if (!location) return false
  return !isLocalWechatHost(location.hostname)
}

/**
 * Pre-flight check for browser Web runtime. Returns a user-facing error or null if fetch may proceed.
 */
export function getWechatWebConnectionIssue(baseUrl: string): string | null {
  const parsed = parseWechatUrl(baseUrl)
  if (!parsed) return '请填写有效的微信服务地址'

  if (typeof globalThis === 'undefined') return null

  const location = getPageLocation()
  if (!location) return null

  const apiIsLocal = isLocalWechatHost(parsed.hostname)
  const apiIsHttp = parsed.protocol === 'http:'
  const pageIsHttps = location.protocol === 'https:'
  const onRemoteHost = isRemoteWebHost()

  if (apiIsLocal && apiIsHttp && (pageIsHttps || onRemoteHost)) {
    if (onRemoteHost) {
      return (
        'Vercel 等线上页面无法访问你电脑上的 http://localhost:5678：' +
        '部署环境没有 Vite 的 /__wechat 代理，且 HTTPS 页面不能请求本机 HTTP。' +
        '请改用桌面版、本地 npm run dev:web，或用 ngrok / Cloudflare Tunnel 暴露为 HTTPS 公网地址后填入。'
      )
    }
    return (
      'HTTPS 页面无法直接请求本机 HTTP 服务（浏览器混合内容限制）。' +
      '请使用本地 http://localhost:5173 开发，或改用 HTTPS 隧道地址。'
    )
  }

  return null
}

/**
 * In Web dev/preview on localhost, map wechat-decrypt to same-origin Vite proxy (`/__wechat`)
 * to avoid browser CORS blocking localhost cross-origin requests.
 */
export function resolveWechatFetchBase(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl)
  const isBrowser =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { document?: unknown }).document !== 'undefined'
  if (!shouldUseWechatDevProxy() || !isBrowser) return normalized

  const parsed = parseWechatUrl(normalized)
  if (!parsed) return normalized

  const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80')
  if (isLocalWechatHost(parsed.hostname) && port === '5678') return '/__wechat'
  return normalized
}

export function extractChatName(raw: Record<string, unknown>): string {
  const chat = raw.chat ?? raw.room ?? raw.group ?? raw.chat_name ?? ''
  return typeof chat === 'string' ? chat : ''
}

export async function healthCheck(apiBase: string): Promise<{ ok: boolean; error?: string }> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 5000)
  try {
    const res = await fetch(`${apiBase}/api/history?limit=1`, { signal: ac.signal })
    if (res.ok) return { ok: true }
    return { ok: false, error: `微信 API 返回 ${res.status}` }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    const corsHint =
      apiBase.startsWith('http') && isRemoteWebHost()
        ? '（若为公网地址，请确认后端已开启 CORS 并允许当前页面来源）'
        : ''
    return { ok: false, error: `无法连接微信服务：${detail}${corsHint}` }
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchHistory(apiBase: string, since: number, limit: number) {
  const url = `${apiBase}/api/history?since=${since}&limit=${limit}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`微信 API 返回 ${res.status}`)
  const json = (await res.json()) as { messages?: unknown[] } | unknown[]
  const messages = Array.isArray(json) ? json : (json.messages ?? [])
  return messages as Record<string, unknown>[]
}

export async function discoverGroupNames(apiBase: string): Promise<string[]> {
  const messages = await fetchHistory(apiBase, 0, 200)
  const names = new Set<string>()
  for (const m of messages) {
    const chat = extractChatName(m)
    if (chat) names.add(chat)
  }
  return Array.from(names).sort()
}

export function groupRawMessagesByChat(msgs: Record<string, unknown>[]) {
  const byChat: Record<string, Record<string, unknown>[]> = {}
  for (const m of msgs) {
    const chat = extractChatName(m)
    if (!chat) continue
    if (!byChat[chat]) byChat[chat] = []
    byChat[chat].push(m)
  }
  return byChat
}

export function computeNextSinceTimestamp(msgs: Record<string, unknown>[]): number {
  const timestamps = msgs
    .map((m) => Number(m.timestamp ?? m.time ?? 0))
    .filter((t) => t > 0)
  if (timestamps.length === 0) return 0
  const maxTs = Math.max(...timestamps)
  const allInt = timestamps.every(Number.isInteger)
  return allInt ? maxTs + 1 : maxTs
}
