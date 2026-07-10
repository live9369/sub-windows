import { tweetToFeedItem, type TweetPayload } from '@/lib/twitterFeed'
import type { FeedItem } from '@/types'
import type { TwitterState } from '@/types/cssApi'

export interface TwitterWebConfig {
  wsUrl: string
  token: string
}

type TweetListener = (item: FeedItem) => void
type StatusListener = (state: TwitterState) => void

class TwitterWebService {
  private ws: WebSocket | null = null
  private running = false
  private state: TwitterState = { state: 'idle' }
  private cfg: TwitterWebConfig | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private readonly tweetListeners = new Set<TweetListener>()
  private readonly statusListeners = new Set<StatusListener>()

  getState(): TwitterState {
    return { ...this.state }
  }

  onTweet(cb: TweetListener) {
    this.tweetListeners.add(cb)
    return () => this.tweetListeners.delete(cb)
  }

  onStatus(cb: StatusListener) {
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }

  async start(cfg: TwitterWebConfig) {
    if (this.running) this.stop()
    this.cfg = cfg
    this.running = true
    this.setState({ state: 'connecting' })
    this.connect()
  }

  stop() {
    this.running = false
    this.cfg = null
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        // ignore
      }
      this.ws = null
    }
    this.setState({ state: 'idle' })
  }

  private setState(next: TwitterState) {
    this.state = next
    for (const cb of this.statusListeners) cb({ ...next })
  }

  private emitTweet(item: FeedItem) {
    for (const cb of this.tweetListeners) cb(item)
  }

  private connect() {
    if (!this.running || !this.cfg) return

    try {
      const ws = new WebSocket(this.cfg.wsUrl)
      this.ws = ws

      ws.onopen = () => {
        if (!this.running) {
          ws.close()
          return
        }
        ws.send(JSON.stringify({ token: this.cfg!.token }))
      }

      ws.onmessage = (event) => {
        if (!this.running) return
        try {
          const data = JSON.parse(String(event.data))
          if (data.status === 'connected') {
            this.setState({ state: 'connected' })
            return
          }
          const item = tweetToFeedItem(data as TweetPayload)
          if (item) this.emitTweet(item)
        } catch (err) {
          console.error('[twitter-web] parse error:', err)
        }
      }

      ws.onclose = () => {
        this.ws = null
        if (this.running) {
          this.setState({ state: 'error', error: '连接已断开' })
          this.scheduleReconnect()
        }
      }

      ws.onerror = () => {
        this.setState({ state: 'error', error: 'WebSocket 连接失败' })
      }
    } catch (err: any) {
      this.setState({ state: 'error', error: err?.message || '连接失败' })
      if (this.running) this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.running) {
        this.setState({ state: 'connecting' })
        this.connect()
      }
    }, 5000)
  }
}

export const twitterWebService = new TwitterWebService()
