import * as React from 'react'
import type { TokenPreset } from '@/data/tokenPresets'

export interface TokenPrice {
  symbol: string
  label: string
  price: number
}

async function fetchPrices(presets: TokenPreset[]): Promise<TokenPrice[]> {
  if (presets.length === 0) return []

  try {
    let data: any
    if (presets.length === 1) {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${presets[0].symbol}`,
        { signal: AbortSignal.timeout(10000) },
      )
      if (!res.ok) return []
      data = await res.json()
      if (!data || !data.price) return []
      data = [data]
    } else {
      const symbols = presets.map((p) => p.symbol)
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(symbols))}`,
        { signal: AbortSignal.timeout(10000) },
      )
      if (!res.ok) return []
      data = await res.json()
      if (!Array.isArray(data)) return []
    }

    const labelMap = new Map(presets.map((p) => [p.symbol, p.label]))
    return data
      .map((item: any) => ({
        symbol: item.symbol as string,
        label: labelMap.get(item.symbol) || item.symbol,
        price: Number(item.price),
      }))
      .filter((p: TokenPrice) => !Number.isNaN(p.price))
  } catch {
    return []
  }
}

export function useBinancePrices(presets: TokenPreset[], intervalMs = 10000) {
  const [prices, setPrices] = React.useState<TokenPrice[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    if (presets.length === 0) {
      setPrices([])
      return
    }
    setLoading(true)
    setError(null)
    const result = await fetchPrices(presets)
    setPrices(result)
    if (result.length === 0 && presets.length > 0) {
      setError('价格获取失败')
    }
    setLoading(false)
  }, [presets])

  React.useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [refresh, intervalMs])

  return { prices, loading, error, refresh }
}
