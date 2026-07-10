import { proxyExternalUrl } from '@/lib/webProxy'

const CHAIN_MAP: Record<string, string> = {
  solana: 'sol',
  eth: 'eth',
  base: 'base',
  bsc: 'bsc',
}

export async function fetchGmgnTokenInfo(
  chain: string,
  address: string,
  apiKey: string,
): Promise<unknown> {
  if (!apiKey?.trim()) {
    throw new Error('请先在设置中配置 GMGN API Key')
  }
  const gmgnChain = CHAIN_MAP[chain] || chain
  const path = `/v1/token/info?chain=${encodeURIComponent(gmgnChain)}&address=${encodeURIComponent(address)}`
  const url = proxyExternalUrl(`https://openapi.gmgn.ai${path}`)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'X-API-KEY': apiKey.trim(),
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GMGN API ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json()
}
