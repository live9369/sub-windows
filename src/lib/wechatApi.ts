/** Shared wechat-decrypt HTTP helpers (Electron main + Web renderer). */

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/$/, '')
}

/**
 * In Web dev/preview, map local wechat-decrypt to same-origin Vite proxy (`/__wechat`)
 * to avoid browser CORS blocking localhost cross-origin requests.
 */
export function resolveWechatFetchBase(baseUrl: string, useDevProxy: boolean): string {
  const normalized = normalizeBaseUrl(baseUrl)
  const isBrowser =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { document?: unknown }).document !== 'undefined'
  if (!useDevProxy || !isBrowser) return normalized

  try {
    const withScheme = normalized.startsWith('http') ? normalized : `http://${normalized}`
    const u = new URL(withScheme)
    const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
    const port = u.port || (u.protocol === 'https:' ? '443' : '80')
    if (isLocal && port === '5678') return '/__wechat'
  } catch {
    // keep original url
  }
  return normalized
}

export function extractChatName(raw: Record<string, unknown>): string {
  const chat = raw.chat ?? raw.room ?? raw.group ?? raw.chat_name ?? ''
  return typeof chat === 'string' ? chat : ''
}

export async function healthCheck(apiBase: string): Promise<boolean> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 5000)
  try {
    const res = await fetch(`${apiBase}/api/history?limit=1`, { signal: ac.signal })
    return res.ok
  } catch {
    return false
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
