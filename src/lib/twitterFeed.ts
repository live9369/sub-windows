import type { FeedItem } from '@/types'

export interface TweetPayload {
  action: string
  original_action?: string | null
  tweet_id?: string
  internal_id?: string
  timestamp?: number
  author?: {
    handle?: string
    name?: string
    avatar?: string
    followers?: number
    tags?: string[]
  }
  content?: {
    text?: string
    media?: { type?: string; url?: string }[]
  }
  reference?: {
    tweet_id?: string
    author_handle?: string
    author_name?: string
    author_avatar?: string
    author_followers?: number
    text?: string
    media?: { type?: string; url?: string }[]
    type?: string
  }
  unfollow_target?: { handle?: string; name?: string }
  avatar_change?: { handle?: string; name?: string; old_avatar?: string; new_avatar?: string }
  bio_change?: { handle?: string; name?: string; old_bio?: string; new_bio?: string }
}

function formatFollowers(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

function relativeTime(ts: number): string {
  const diff = Date.now() / 1000 - ts
  const mins = Math.floor(diff / 60)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function tweetToFeedItem(msg: TweetPayload): FeedItem | null {
  const action = msg.action
  const author = msg.author

  if (action === 'tweet' && author && msg.content) {
    const handle = author.handle ?? 'unknown'
    const name = author.name ?? handle
    const text = msg.content.text ?? ''
    const media = msg.content.media ?? []
    const firstImage = media.find((m) => m.type === 'photo' || m.type === 'image')

    let content = text
    const ref = msg.reference
    if (ref && ref.text) {
      const refType = ref.type === 'quoted' ? '引用' : ref.type === 'replied_to' ? '回复' : '转推'
      content = `${text}\n\n┌─ ${refType} @${ref.author_handle ?? 'unknown'}\n${ref.text}`
    }

    const tags: string[] = []
    if (author.tags && author.tags.length > 0) tags.push(...author.tags)
    if (author.followers && author.followers > 100000) {
      tags.push(`${formatFollowers(author.followers)} followers`)
    }

    return {
      id: `tw-${msg.internal_id ?? msg.tweet_id ?? `${handle}-${msg.timestamp}`}`,
      source: 'x',
      author: name,
      handle: `@${handle}`,
      avatarColor: 'bg-zinc-800 text-zinc-300',
      avatarLabel: name.slice(0, 2).toUpperCase(),
      avatarUrl: author.avatar,
      verified: author.tags?.includes('Smart_kol') || author.tags?.includes('verified'),
      time: relativeTime(msg.timestamp ?? Date.now() / 1000),
      content,
      link: `https://x.com/${handle}/status/${msg.tweet_id ?? ''}`,
      imageUrl: firstImage?.url,
      tags: tags.length > 0 ? tags : undefined,
      category: ref ? (ref.type === 'quoted' ? 'QUOTE' : ref.type === 'replied_to' ? 'REPLY' : 'RT') : 'TWEET',
    }
  }

  if (action === 'unfollow' && msg.unfollow_target) {
    const t = msg.unfollow_target
    return {
      id: `tw-unfollow-${t.handle}-${Date.now()}`,
      source: 'x',
      author: t.name ?? t.handle ?? 'unknown',
      handle: `@${t.handle ?? 'unknown'}`,
      avatarColor: 'bg-rose-500/20 text-rose-300',
      avatarLabel: 'UN',
      time: '刚刚',
      content: `取消关注了 @${t.handle ?? ''}`,
      link: `https://x.com/${t.handle ?? ''}`,
      category: 'UNFOLLOW',
    }
  }

  if (action === 'avatar_change' && msg.avatar_change) {
    const t = msg.avatar_change
    return {
      id: `tw-avatar-${t.handle}-${Date.now()}`,
      source: 'x',
      author: t.name ?? t.handle ?? 'unknown',
      handle: `@${t.handle ?? 'unknown'}`,
      avatarColor: 'bg-violet-500/20 text-violet-300',
      avatarLabel: 'AV',
      time: '刚刚',
      content: '更换了头像',
      link: `https://x.com/${t.handle ?? ''}`,
      category: 'AVATAR',
    }
  }

  if (action === 'bio_change' && msg.bio_change) {
    const t = msg.bio_change
    return {
      id: `tw-bio-${t.handle}-${Date.now()}`,
      source: 'x',
      author: t.name ?? t.handle ?? 'unknown',
      handle: `@${t.handle ?? 'unknown'}`,
      avatarColor: 'bg-cyan-500/20 text-cyan-300',
      avatarLabel: 'BIO',
      time: '刚刚',
      content: `更新了简介: ${t.new_bio ?? ''}`,
      link: `https://x.com/${t.handle ?? ''}`,
      category: 'BIO',
    }
  }

  return null
}
