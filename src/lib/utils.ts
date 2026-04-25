import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
  Chain,
  ExtractedMarketCap,
  ExtractedSignal,
  ExtractedToken,
  MessageHighlights,
} from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 合约地址正则
 *  - Solana: Base58 32-44 位
 *  - EVM: 0x + 40 位 hex
 *
 * 用全局匹配器以便提取所有出现位置。
 */
const SOLANA_CA_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g
const EVM_CA_RE = /\b0x[a-fA-F0-9]{40}\b/g

/** 市值: $42.8K / $1.2M / $850K / $1B  — K/M/B 后缀必填，避免误匹配纯美金额 */
const MC_RE = /\$\s?\d+(?:\.\d+)?\s?[KkMmBb]\b/g

/** 信号词 / 表情 */
const SIGNAL_WORDS = [
  'moon', 'mooning', '100x', '50x', '20x', '10x',
  'pump', 'pumping', 'gem', 'alpha', 'ape', 'aping',
  '冲', '梭', '上车', '起飞', '突破',
]

const SIGNAL_EMOJIS = ['🚀', '🔥', '💎', '🌙', '⚡', '🎯', '📈', '💯']

const SIGNAL_RE = new RegExp(
  `(${SIGNAL_WORDS.join('|')})|(${SIGNAL_EMOJIS.map(e => escapeRegExp(e)).join('|')})`,
  'gi',
)

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function detectTokens(text: string): ExtractedToken[] {
  const tokens: ExtractedToken[] = []
  // EVM 优先（更严格）
  for (const m of text.matchAll(EVM_CA_RE)) {
    if (m.index === undefined) continue
    tokens.push({
      raw: m[0],
      chain: 'eth',
      start: m.index,
      end: m.index + m[0].length,
    })
  }
  // Solana — 排除已经被 EVM 标记的位置
  for (const m of text.matchAll(SOLANA_CA_RE)) {
    if (m.index === undefined) continue
    const overlap = tokens.some(
      t => m.index! >= t.start && m.index! < t.end,
    )
    if (overlap) continue
    // EVM 0x 前缀本身已被排除（Base58 不含 0/O/I/l）
    tokens.push({
      raw: m[0],
      chain: 'solana',
      start: m.index,
      end: m.index + m[0].length,
    })
  }
  return tokens.sort((a, b) => a.start - b.start)
}

export function detectMarketCaps(text: string): ExtractedMarketCap[] {
  const caps: ExtractedMarketCap[] = []
  for (const m of text.matchAll(MC_RE)) {
    if (m.index === undefined) continue
    caps.push({
      raw: m[0],
      value: parseMarketCap(m[0]),
      start: m.index,
      end: m.index + m[0].length,
    })
  }
  return caps
}

export function parseMarketCap(s: string): number {
  const match = s.match(/(\d+(?:\.\d+)?)\s?([KkMmBb]?)/)
  if (!match) return 0
  const n = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  switch (unit) {
    case 'K': return n * 1_000
    case 'M': return n * 1_000_000
    case 'B': return n * 1_000_000_000
    default:  return n
  }
}

export function detectSignals(text: string): ExtractedSignal[] {
  const signals: ExtractedSignal[] = []
  for (const m of text.matchAll(SIGNAL_RE)) {
    if (m.index === undefined) continue
    signals.push({
      raw: m[0],
      start: m.index,
      end: m.index + m[0].length,
    })
  }
  return signals
}

export function extractHighlights(text: string): MessageHighlights {
  return {
    tokens: detectTokens(text),
    marketCaps: detectMarketCaps(text),
    signals: detectSignals(text),
  }
}

export function shortenAddress(addr: string, head = 4, tail = 4) {
  if (!addr) return ''
  if (addr.length <= head + tail + 2) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}

export function dexScreenerUrl(chain: Chain, ca: string) {
  const base = 'https://dexscreener.com'
  switch (chain) {
    case 'solana': return `${base}/solana/${ca}`
    case 'eth':    return `${base}/ethereum/${ca}`
    case 'base':   return `${base}/base/${ca}`
    case 'bsc':    return `${base}/bsc/${ca}`
  }
}

export function formatRelativeTime(iso: string) {
  const t = new Date(iso).getTime()
  const diffSec = Math.floor((Date.now() - t) / 1000)
  if (diffSec < 60) return `${diffSec}s`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`
  return `${Math.floor(diffSec / 86400)}d`
}

export function formatNumberCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (window.cssApi?.copyText) {
      return await window.cssApi.copyText(text)
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

export async function openExternalLink(url: string): Promise<void> {
  if (window.cssApi?.openExternal) {
    await window.cssApi.openExternal(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * 包含/排除关键词过滤；逗号或空格分隔。空字符串视为无过滤。
 */
export function matchKeywords(text: string, csv: string): boolean {
  const list = csv
    .split(/[,\s，]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  if (list.length === 0) return true
  const lower = text.toLowerCase()
  return list.some(kw => lower.includes(kw))
}
