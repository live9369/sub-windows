import * as React from 'react'
import { ExternalLink, Hash, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, openExternalLink } from '@/lib/utils'
import type { FeedItem } from '@/types'

function AvatarFallback({ item }: { item: FeedItem }) {
  const [failed, setFailed] = React.useState(false)
  if (!item.avatarUrl || failed) {
    return (
      <div
        className={cn(
          'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase',
          item.avatarColor,
        )}
      >
        {item.avatarLabel}
      </div>
    )
  }
  return (
    <img
      src={item.avatarUrl}
      alt={item.author}
      className="shrink-0 w-9 h-9 rounded-full object-cover border border-zinc-800"
      onError={() => setFailed(true)}
    />
  )
}

const SOURCE_LABEL: Record<FeedItem['source'], { label: string; tone: string }> = {
  x:       { label: 'X',         tone: 'text-zinc-300' },
  binance: { label: 'BINANCE',   tone: 'text-amber-300' },
  news:    { label: 'NEWS',       tone: 'text-cyan-300' },
}

export const FeedCard: React.FC<{ item: FeedItem; query?: string }> = ({
  item,
  query,
}) => {
  const handleOpen = () => {
    void openExternalLink(item.link)
  }

  return (
    <article
      onClick={handleOpen}
      className={cn(
        'group relative px-3 py-3 cursor-pointer transition-colors',
        'hover:bg-zinc-900/70',
        'border-b border-zinc-900',
      )}
    >
      <div className="flex items-start gap-2.5">
        <AvatarFallback item={item} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-[13px] font-semibold text-zinc-100 truncate">
                {item.author}
              </span>
              {item.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="text-[11px] text-zinc-500 truncate">
                {item.handle}
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-[11px] text-zinc-500">{item.time}</span>
            </div>
            <Badge
              variant="muted"
              className={cn(SOURCE_LABEL[item.source].tone, 'shrink-0')}
            >
              {item.category ?? SOURCE_LABEL[item.source].label}
            </Badge>
          </div>

          <p className="text-[12.5px] leading-relaxed text-zinc-200 break-words whitespace-pre-wrap">
            {highlightContent(item.content, query)}
          </p>

          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt="media"
              className="mt-2 rounded-lg border border-zinc-800 max-h-48 object-cover"
              loading="lazy"
            />
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 h-5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                >
                  <Hash className="w-2.5 h-2.5 text-zinc-500" />
                  {t.replace(/^[#$]/, '')}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 truncate font-mono">
              {item.link.replace(/^https?:\/\//, '').slice(0, 48)}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-emerald-300 font-mono inline-flex items-center gap-1">
              在浏览器打开
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function highlightContent(content: string, query?: string): React.ReactNode {
  const q = (query ?? '').trim()
  if (!q) return content
  const lower = content.toLowerCase()
  const lq = q.toLowerCase()
  if (!lower.includes(lq)) return content
  const out: React.ReactNode[] = []
  let from = 0
  let i = 0
  while (true) {
    const next = lower.indexOf(lq, from)
    if (next === -1) break
    if (next > from) out.push(<React.Fragment key={`t-${i}`}>{content.slice(from, next)}</React.Fragment>)
    out.push(
      <mark
        key={`m-${i}`}
        className="bg-cyan-500/25 text-cyan-200 rounded px-0.5"
      >
        {content.slice(next, next + lq.length)}
      </mark>,
    )
    from = next + lq.length
    i += 1
  }
  if (from < content.length) {
    out.push(<React.Fragment key="rest">{content.slice(from)}</React.Fragment>)
  }
  return out
}
