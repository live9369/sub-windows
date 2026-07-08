import * as React from 'react'
import {
  Copy,
  ExternalLink,
  Check,
  Pin,
  Flame,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TokenHoverCard } from '@/components/TokenHoverCard'
import {
  copyToClipboard,
  dexScreenerUrl,
  extractHighlights,
  openExternalLink,
  shortenAddress,
  cn,
} from '@/lib/utils'
import type { ChatMessage as ChatMsg, Chain } from '@/types'

export interface ChatMessageProps {
  message: ChatMsg
  query?: string
}

interface Segment {
  start: number
  end: number
  kind: 'text' | 'token' | 'marketcap' | 'signal'
  data?: { chain?: Chain; raw: string }
}

function buildSegments(text: string): Segment[] {
  const h = extractHighlights(text)
  const ranges: Segment[] = [
    ...h.tokens.map<Segment>((t) => ({
      start: t.start,
      end: t.end,
      kind: 'token',
      data: { chain: t.chain, raw: t.raw },
    })),
    ...h.marketCaps.map<Segment>((m) => ({
      start: m.start,
      end: m.end,
      kind: 'marketcap',
      data: { raw: m.raw },
    })),
    ...h.signals.map<Segment>((s) => ({
      start: s.start,
      end: s.end,
      kind: 'signal',
      data: { raw: s.raw },
    })),
  ].sort((a, b) => a.start - b.start)

  // 去重叠（高亮以 token > marketcap > signal 优先）
  const order: Record<Segment['kind'], number> = {
    text: 0, token: 3, marketcap: 2, signal: 1,
  }
  const filtered: Segment[] = []
  for (const r of ranges) {
    const conflict = filtered.find(
      (f) => !(r.end <= f.start || r.start >= f.end),
    )
    if (!conflict) {
      filtered.push(r)
    } else if (order[r.kind] > order[conflict.kind]) {
      filtered.splice(filtered.indexOf(conflict), 1)
      filtered.push(r)
    }
  }
  filtered.sort((a, b) => a.start - b.start)

  // 填充 text 区间
  const segs: Segment[] = []
  let cursor = 0
  for (const f of filtered) {
    if (cursor < f.start) {
      segs.push({ start: cursor, end: f.start, kind: 'text' })
    }
    segs.push(f)
    cursor = f.end
  }
  if (cursor < text.length) {
    segs.push({ start: cursor, end: text.length, kind: 'text' })
  }
  return segs
}

const TokenChip: React.FC<{ chain: Chain; ca: string }> = ({ chain, ca }) => {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = async () => {
    if (await copyToClipboard(ca)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    }
  }
  const handleOpen = () => {
    void openExternalLink(dexScreenerUrl(chain, ca))
  }
  return (
    <TokenHoverCard chain={chain} ca={ca}>
      <span
        className="inline-flex items-center gap-1 align-baseline rounded-md px-1.5 py-0.5 mx-0.5 my-0.5 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-400/70 hover:bg-emerald-500/15 transition-colors group"
        title={ca}
      >
        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
          {chain === 'eth' ? 'ETH' : 'SOL'}
        </span>
        <span className="font-mono text-[11px] text-emerald-200">
          {shortenAddress(ca)}
        </span>
        <button
          onClick={handleCopy}
          className="text-emerald-300/80 hover:text-emerald-200"
          title="复制 CA"
        >
          {copied
            ? <Check className="w-3 h-3" />
            : <Copy className="w-3 h-3" />}
        </button>
        <button
          onClick={handleOpen}
          className="text-emerald-300/80 hover:text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity"
          title="DexScreener"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </span>
    </TokenHoverCard>
  )
}

const MarketCapChip: React.FC<{ raw: string }> = ({ raw }) => (
  <span
    className="inline-flex items-center align-baseline rounded px-1.5 py-0 mx-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px]"
    title="市值 (Market Cap)"
  >
    {raw}
  </span>
)

const SignalChip: React.FC<{ raw: string }> = ({ raw }) => (
  <span
    className="inline-flex items-center align-baseline rounded px-1 py-0 mx-0.5 bg-orange-500/15 border border-orange-500/40 text-orange-300 text-[11px] font-medium"
    title="信号词 / 高热"
  >
    {raw}
  </span>
)

const HighlightedText: React.FC<{ text: string; query?: string }> = ({
  text,
  query,
}) => {
  const segments = React.useMemo(() => buildSegments(text), [text])
  const q = (query ?? '').trim().toLowerCase()

  return (
    <>
      {segments.map((seg, i) => {
        const slice = text.slice(seg.start, seg.end)
        if (seg.kind === 'token' && seg.data?.chain) {
          return <TokenChip key={i} chain={seg.data.chain} ca={slice} />
        }
        if (seg.kind === 'marketcap') {
          return <MarketCapChip key={i} raw={slice} />
        }
        if (seg.kind === 'signal') {
          return <SignalChip key={i} raw={slice} />
        }
        if (q && slice.toLowerCase().includes(q)) {
          return renderQueryMatch(slice, q, i)
        }
        return <React.Fragment key={i}>{slice}</React.Fragment>
      })}
    </>
  )
}

function renderQueryMatch(text: string, q: string, key: number): React.ReactNode {
  const parts: React.ReactNode[] = []
  let idx = 0
  const lower = text.toLowerCase()
  let from = 0
  while (true) {
    const next = lower.indexOf(q, from)
    if (next === -1) break
    if (next > from) parts.push(text.slice(from, next))
    parts.push(
      <mark
        key={`m-${key}-${idx++}`}
        className="bg-cyan-500/25 text-cyan-200 rounded px-0.5"
      >
        {text.slice(next, next + q.length)}
      </mark>,
    )
    from = next + q.length
  }
  if (from < text.length) parts.push(text.slice(from))
  return <React.Fragment key={key}>{parts}</React.Fragment>
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, query }) => {
  return (
    <div
      className={cn(
        'group relative px-3 py-2 hover:bg-zinc-900/60 transition-colors',
        'border-l-2',
        message.isPinned ? 'border-cyan-500/60 bg-cyan-500/[0.04]'
          : message.isHot   ? 'border-orange-500/60 bg-orange-500/[0.03]'
          : 'border-transparent',
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'shrink-0 mt-0.5 w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold uppercase',
            message.avatarColor,
          )}
        >
          {message.username.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[12px] font-semibold text-zinc-100 truncate">
              {message.username}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {message.time}
            </span>
            {message.isPinned && (
              <Badge variant="cyan">
                <Pin className="w-2.5 h-2.5" /> 置顶
              </Badge>
            )}
            {message.isHot && (
              <Badge variant="orange">
                <Flame className="w-2.5 h-2.5" /> 热议
              </Badge>
            )}
          </div>
          <div className="text-[12.5px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
            <HighlightedText text={message.content} query={query} />
          </div>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="msg"
              className="mt-1.5 max-h-32 rounded-md border border-zinc-800 object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
