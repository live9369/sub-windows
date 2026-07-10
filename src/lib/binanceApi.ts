import { proxyExternalUrl } from '@/lib/webProxy'

export async function fetchBinancePrices(
  symbols: string[],
): Promise<Array<{ symbol: string; price: string }>> {
  const valid = symbols
    .map((s) => String(s || '').trim().toUpperCase())
    .filter((s) => /^[A-Z0-9]{3,20}$/.test(s))
  if (valid.length === 0) return []

  const path =
    valid.length === 1
      ? `/api/v3/ticker/price?symbol=${encodeURIComponent(valid[0])}`
      : `/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(valid))}`

  const url = proxyExternalUrl(`https://api.binance.com${path}`)
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Binance API ${res.status}: ${body.slice(0, 120)}`)
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return [data]
  return []
}
