import { createWxGroup, wxToChatMessages } from '@/lib/wechatAdapter'
import type { WechatBatch, WechatState } from '@/types/cssApi'
import {
  computeNextSinceTimestamp,
  discoverGroupNames,
  getWechatWebConnectionIssue,
  groupRawMessagesByChat,
  healthCheck,
  fetchHistory,
  normalizeBaseUrl,
  resolveWechatFetchBase,
} from '@/lib/wechatApi'

export interface WechatWebConfig {
  baseUrl: string
  pollIntervalMs: number
}

type BatchListener = (batch: WechatBatch) => void
type StatusListener = (state: WechatState) => void

class WechatWebService {
  private timer: ReturnType<typeof setTimeout> | null = null
  private running = false
  private state: WechatState = { state: 'idle' }
  private lastTimestamp = 0
  private cfg: WechatWebConfig | null = null
  private readonly batchListeners = new Set<BatchListener>()
  private readonly statusListeners = new Set<StatusListener>()

  getState(): WechatState {
    return { ...this.state }
  }

  onBatch(cb: BatchListener) {
    this.batchListeners.add(cb)
    return () => this.batchListeners.delete(cb)
  }

  onStatus(cb: StatusListener) {
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }

  async discover(baseUrl: string): Promise<string[]> {
    const issue = getWechatWebConnectionIssue(baseUrl)
    if (issue) throw new Error(issue)
    const apiBase = resolveWechatFetchBase(baseUrl)
    return discoverGroupNames(apiBase)
  }

  async start(cfg: WechatWebConfig) {
    if (this.running) this.stop()

    this.cfg = {
      baseUrl: normalizeBaseUrl(cfg.baseUrl),
      pollIntervalMs: Number(cfg.pollIntervalMs) || 3000,
    }
    this.setState({ state: 'starting' })

    const issue = getWechatWebConnectionIssue(this.cfg.baseUrl)
    if (issue) {
      this.setState({ state: 'error', error: issue })
      throw new Error(issue)
    }

    const apiBase = resolveWechatFetchBase(this.cfg.baseUrl)
    const health = await healthCheck(apiBase)
    if (!health.ok) {
      const error =
        health.error ||
        '无法连接到微信解密服务。请确认后端已手动启动；Web 本地开发请使用 http://localhost:5678'
      this.setState({ state: 'error', error })
      throw new Error(error)
    }

    this.running = true
    this.setState({ state: 'running' })
    void this.poll()
  }

  stop() {
    this.running = false
    this.lastTimestamp = 0
    this.cfg = null
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.setState({ state: 'idle' })
  }

  private setState(next: WechatState) {
    this.state = next
    for (const cb of this.statusListeners) cb({ ...next })
  }

  private emitBatch(batch: WechatBatch) {
    for (const cb of this.batchListeners) cb(batch)
  }

  private async poll() {
    if (!this.running || !this.cfg) return

    const apiBase = resolveWechatFetchBase(this.cfg.baseUrl)
    const displayBase = this.cfg.baseUrl

    try {
      const msgs = await fetchHistory(apiBase, this.lastTimestamp, 200)
      if (msgs.length > 0) {
        const byChat = groupRawMessagesByChat(msgs)
        for (const [chatName, chatMsgs] of Object.entries(byChat)) {
          this.emitBatch({
            groupId: createWxGroup(chatName).id,
            groupName: chatName,
            messages: wxToChatMessages(chatName, chatMsgs as any[], displayBase),
          })
        }
        this.lastTimestamp = computeNextSinceTimestamp(msgs)
      }
    } catch (err) {
      console.error('[wechat-web] poll error:', err)
    }

    if (this.running && this.cfg) {
      this.timer = setTimeout(() => void this.poll(), this.cfg.pollIntervalMs)
    }
  }
}

export const wechatWebService = new WechatWebService()
