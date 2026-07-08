import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  TrendingUp,
  Droplets,
  Users,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Twitter,
  Loader2,
  AlertTriangle,
  MessageCircle,
  Github,
  Send,
} from 'lucide-react'
import type { Chain } from '@/types'

export interface TokenHoverCardProps {
  chain: Chain
  ca: string
  children: React.ReactNode
}

interface GmgnTokenData {
  name?: string | number
  symbol?: string | number
  price?: string | number
  circulating_supply?: string | number
  total_supply?: string | number
  holder_count?: string | number
  liquidity?: string | number
  is_honeypot?: boolean | number | string
  renounced_mint?: boolean | number | string
  renounced_freeze_account?: boolean | number | string
  owner_renounced?: string
  rug_ratio?: string | number
  link?: {
    twitter_username?: string
    website?: string
    telegram?: string
    discord?: string
    github?: string
    description?: string
    [key: string]: any
  }
  dev?: {
    top_10_holder_rate?: string | number
    [key: string]: any
  }
  stat?: {
    top_10_holder_rate?: string | number
    dev_team_hold_rate?: string | number
    [key: string]: any
  }
  [key: string]: any
}

function toNum(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : undefined
}

function formatNum(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return '-'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(4)
}

function formatPrice(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return '-'
  if (n >= 1) return `$${n.toFixed(2)}`
  if (n >= 0.00001) {
    return `$${n.toFixed(8).replace(/\.?0+$/, '')}`
  }
  const s = n.toFixed(20)
  const match = s.match(/^0\.(0+)(\d)/)
  if (match) {
    const zeroCount = match[1].length
    const rest = s.slice(match[0].length - 1).replace(/0+$/, '')
    return `$0.0{${zeroCount}}${rest.slice(0, 5)}`
  }
  return `$${n.toFixed(10).replace(/\.?0+$/, '')}`
}

function calcMc(data: GmgnTokenData): number | undefined {
  const price = toNum(data.price)
  const supply = toNum(data.circulating_supply)
  if (price !== undefined && supply !== undefined) {
    return price * supply
  }
  return undefined
}

function toStr(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return undefined
}

function isTruthy(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v !== '0' && v !== 'false' && v !== ''
  return true
}

const CHAIN_COLORS: Record<Chain, { accent: string; ring: string; bg: string; text: string }> = {
  eth: { accent: '#06b6d4', ring: 'ring-cyan-500/40', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  solana: { accent: '#34d399', ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  base: { accent: '#3b82f6', ring: 'ring-blue-500/40', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  bsc: { accent: '#f59e0b', ring: 'ring-amber-500/40', bg: 'bg-amber-500/15', text: 'text-amber-400' },
}

function chainColor(chain: Chain) {
  return CHAIN_COLORS[chain] || { accent: '#71717a', ring: 'ring-zinc-500/40', bg: 'bg-zinc-500/15', text: 'text-zinc-400' }
}

const CARD_WIDTH = 340

export const TokenHoverCard: React.FC<TokenHoverCardProps> = ({
  chain,
  ca,
  children,
}) => {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState<{
    top: number
    left: number
    placement: 'top' | 'bottom'
  }>({ top: 0, left: 0, placement: 'top' })
  const [data, setData] = React.useState<GmgnTokenData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const anchorRef = React.useRef<HTMLSpanElement | null>(null)

  const c = chainColor(chain)
  const accentColor = c.accent

  const fetchData = React.useCallback(async () => {
    if (data) return
    setLoading(true)
    setError(null)
    try {
      const res = (await window.cssApi!.gmgnTokenInfo(chain, ca)) as GmgnTokenData
      setData(res)
    } catch (err: any) {
      setError(err?.message || '获取失败')
    } finally {
      setLoading(false)
    }
  }, [chain, ca, data])

  const updatePosition = React.useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const padding = 8
    const halfWidth = CARD_WIDTH / 2
    const estimatedHeight = 400

    let left = rect.left + rect.width / 2
    if (left - halfWidth < padding) {
      left = halfWidth + padding
    } else if (left + halfWidth > window.innerWidth - padding) {
      left = window.innerWidth - halfWidth - padding
    }

    const spaceAbove = rect.top
    let top: number
    let placement: 'top' | 'bottom'
    if (spaceAbove < estimatedHeight + padding) {
      top = rect.bottom + padding
      placement = 'bottom'
    } else {
      top = rect.top - padding
      placement = 'top'
    }

    setPos({ top, left, placement })
  }, [])

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePosition()
      setOpen(true)
      void fetchData()
    }, 300)
  }

  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setOpen(false)
    }, 200)
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // 基础字段
  const mc = calcMc(data || {})
  const name = toStr(data?.name)
  const symbol = toStr(data?.symbol)
  const displaySymbol = symbol || name || '?'
  const price = toNum(data?.price)
  const liquidity = toNum(data?.liquidity)
  const holderCount = toNum(data?.holder_count)
  const rugRatio = toNum(data?.rug_ratio)
  const isHoneypot = isTruthy(data?.is_honeypot)
  const isRenounced =
    isTruthy(data?.renounced_mint) ||
    isTruthy(data?.renounced_freeze_account) ||
    data?.owner_renounced === 'yes'

  // GMGN API 嵌套字段提取
  const link = data?.link
  const dev = data?.dev
  const stat = data?.stat

  const narrative = toStr(link?.description)

  const top10Rate = toNum(dev?.top_10_holder_rate ?? stat?.top_10_holder_rate)
  const devHoldRate = toNum(stat?.dev_team_hold_rate)

  const twitterUsername = toStr(link?.twitter_username)
  const websiteUrl = toStr(link?.website)
  const telegramUrl = toStr(link?.telegram)
  const discordUrl = toStr(link?.discord)
  const githubUrl = toStr(link?.github)

  const socials: { url: string; label: string; icon: React.ReactNode; color: string }[] = []
  if (twitterUsername) {
    socials.push({
      url: `https://x.com/${twitterUsername}`,
      label: 'X/Twitter',
      icon: <Twitter className="w-3 h-3" />,
      color: 'text-sky-400 hover:text-sky-300',
    })
  }
  if (websiteUrl) {
    socials.push({
      url: websiteUrl,
      label: 'Website',
      icon: <Globe className="w-3 h-3" />,
      color: 'text-emerald-400 hover:text-emerald-300',
    })
  }
  if (telegramUrl) {
    socials.push({
      url: telegramUrl,
      label: 'Telegram',
      icon: <Send className="w-3 h-3" />,
      color: 'text-cyan-400 hover:text-cyan-300',
    })
  }
  if (discordUrl) {
    socials.push({
      url: discordUrl,
      label: 'Discord',
      icon: <MessageCircle className="w-3 h-3" />,
      color: 'text-indigo-400 hover:text-indigo-300',
    })
  }
  if (githubUrl) {
    socials.push({
      url: githubUrl,
      label: 'GitHub',
      icon: <Github className="w-3 h-3" />,
      color: 'text-zinc-300 hover:text-zinc-200',
    })
  }

  const cardContent = (
    <div
      onMouseEnter={() => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }}
      onMouseLeave={handleLeave}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: pos.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        width: CARD_WIDTH,
        zIndex: 9999,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
      }}
      className="rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden"
    >
      {/* Top accent bar */}
      <div style={{ height: 3, backgroundColor: accentColor, width: '100%' }} />

      {/* Arrow */}
      <div
        className={
          pos.placement === 'top'
            ? 'absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 rotate-45'
            : 'absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-zinc-900 border-l border-t border-zinc-700 rotate-45'
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-10 text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs">正在获取 Token 数据…</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-6 text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="px-3.5 py-3 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`shrink-0 mt-0.5 w-9 h-9 rounded-md flex items-center justify-center text-[12px] font-bold uppercase ring-2 ${c.ring} ${c.bg} ${c.text}`}
            >
              {displaySymbol.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[13px] font-bold text-zinc-100 truncate">
                  {name || symbol || 'Unknown'}
                </div>
                <div className="text-[13px] font-bold text-emerald-400 shrink-0">
                  {formatPrice(price)}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-zinc-500">
                  {ca.slice(0, 6)}…{ca.slice(-4)}
                </span>
                <span
                  className="text-[9px] uppercase font-bold px-1 py-0.5 rounded"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {chain === 'eth' ? 'ETH' : chain === 'solana' ? 'SOL' : chain === 'base' ? 'BASE' : chain === 'bsc' ? 'BSC' : chain}
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded bg-zinc-800/50 px-2 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> MC
              </div>
              <div className="text-[11px] font-semibold text-zinc-200">
                {mc !== undefined ? `$${formatNum(mc)}` : '-'}
              </div>
            </div>
            <div className="rounded bg-zinc-800/50 px-2 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
                <Droplets className="w-2.5 h-2.5" /> LP
              </div>
              <div className="text-[11px] font-semibold text-zinc-200">
                {liquidity !== undefined ? `$${formatNum(liquidity)}` : '-'}
              </div>
            </div>
            <div className="rounded bg-zinc-800/50 px-2 py-1.5">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5">
                <Users className="w-2.5 h-2.5" /> Holders
              </div>
              <div className="text-[11px] font-semibold text-zinc-200">
                {holderCount !== undefined ? formatNum(holderCount) : '-'}
              </div>
            </div>
          </div>

          {/* Holder distribution */}
          {(top10Rate !== undefined || devHoldRate !== undefined) && (
            <div className="grid grid-cols-2 gap-2">
              {top10Rate !== undefined && (
                <div className="rounded bg-zinc-800/50 px-2 py-1.5">
                  <div className="text-[10px] text-zinc-500 mb-0.5">Top 10</div>
                  <div className={`text-[11px] font-semibold ${top10Rate > 0.5 ? 'text-rose-400' : 'text-zinc-200'}`}>
                    {(top10Rate * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              {devHoldRate !== undefined && (
                <div className="rounded bg-zinc-800/50 px-2 py-1.5">
                  <div className="text-[10px] text-zinc-500 mb-0.5">Dev</div>
                  <div className={`text-[11px] font-semibold ${devHoldRate > 0.1 ? 'text-amber-400' : 'text-zinc-200'}`}>
                    {(devHoldRate * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Narrative */}
          {narrative ? (
            <div className="rounded bg-zinc-800/30 px-2.5 py-2 border border-zinc-800">
              <div className="text-[10px] font-semibold text-zinc-500 mb-1">叙事</div>
              <p className="text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap break-words max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                {narrative}
              </p>
            </div>
          ) : (
            <div className="rounded bg-zinc-800/30 px-2.5 py-2 border border-zinc-800">
              <div className="text-[10px] font-semibold text-zinc-500 mb-1">叙事</div>
              <p className="text-[11px] text-zinc-600 italic">暂无叙事数据</p>
            </div>
          )}

          {/* Security tags */}
          <div className="flex flex-wrap gap-1.5">
            {isHoneypot ? (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px]">
                <ShieldAlert className="w-2.5 h-2.5" /> Honeypot
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px]">
                <ShieldCheck className="w-2.5 h-2.5" /> Safe
              </span>
            )}
            {isRenounced && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px]">
                Renounced
              </span>
            )}
            {rugRatio !== undefined && rugRatio > 0.3 && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]">
                Rug Risk {(rugRatio * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/60 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1 text-[10px] transition-colors ${s.color}`}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {open && ReactDOM.createPortal(cardContent, document.body)}
    </span>
  )
}
