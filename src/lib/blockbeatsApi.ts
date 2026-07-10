import { proxyExternalUrl } from '@/lib/webProxy'

export async function fetchBlockbeatsRss(
  apiKey: string,
  page = 1,
  size = 20,
): Promise<string> {
  const path = `/v1/rss/newsflash?page=${page}&size=${size}`
  const url = proxyExternalUrl(`http://api-pro.theblockbeats.info${path}`)
  const res = await fetch(url, {
    headers: { 'api-key': apiKey || '-' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`BlockBeats API ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.text()
}
