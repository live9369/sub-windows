/** Map external API URLs to same-origin Vite dev/preview proxies. */

export function proxyExternalUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = `${u.pathname}${u.search}`

    if (u.hostname === 'api.binance.com') return `/__binance${path}`
    if (u.hostname === 'www.binance.com') return `/__binance-bapi${path}`
    if (u.hostname === 'api-pro.theblockbeats.info') return `/__blockbeats${path}`
    if (u.hostname === 'openapi.gmgn.ai' || u.hostname === 'api.gmgn.ai') {
      return `/__gmgn${path}`
    }
  } catch {
    // keep original
  }
  return url
}
