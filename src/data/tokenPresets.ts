export interface TokenPreset {
  symbol: string
  label: string
}

export const DEFAULT_TOKEN_PRESETS: TokenPreset[] = [
  { symbol: 'BTCUSDT', label: 'BTC' },
  { symbol: 'ETHUSDT', label: 'ETH' },
  { symbol: 'SOLUSDT', label: 'SOL' },
]

export function serializeTokenPresets(presets: TokenPreset[]): string {
  return JSON.stringify(presets)
}

export function parseTokenPresets(raw: string): TokenPreset[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as TokenPreset[]
  } catch {
    // ignore
  }
  return []
}
