import { spawn, type ChildProcess } from 'node:child_process'
import type { BrowserWindow } from 'electron'
import { createWxGroup, wxToChatMessages } from '../src/lib/wechatAdapter'

export interface WechatServiceConfig {
  baseUrl: string
  pollIntervalMs: number
  spawn?: {
    pythonPath: string
    scriptPath: string
  }
}

export interface WechatServiceState {
  state: 'idle' | 'starting' | 'running' | 'error'
  error?: string
  pid?: number
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function fetchOk(url: string, timeout = 5000) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ac.signal })
    clearTimeout(t)
    return res.ok
  } catch {
    clearTimeout(t)
    return false
  }
}

export class WechatService {
  private child: ChildProcess | null = null
  private timer: NodeJS.Timeout | null = null
  private running = false
  private state: WechatServiceState = { state: 'idle' }
  private lastTimestamp = 0
  private win: BrowserWindow | null = null

  attachWindow(win: BrowserWindow) {
    this.win = win
  }

  getState(): WechatServiceState {
    return { ...this.state }
  }

  private emitState() {
    if (!this.win || this.win.isDestroyed()) return
    this.win.webContents.send('wechat:status', this.state)
  }

  async discover(baseUrl: string): Promise<string[]> {
    const res = await fetch(`${baseUrl}/api/history?limit=200`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error('无法获取群聊列表')
    const json = (await res.json()) as any
    const msgs: any[] = json.messages ?? json ?? []
    const names = new Set<string>()
    for (const m of msgs) {
      const chat = m.chat ?? m.room ?? m.group ?? m.chat_name ?? ''
      if (chat && typeof chat === 'string') names.add(chat)
    }
    return Array.from(names).sort()
  }

  async start(cfg: WechatServiceConfig) {
    if (this.running) {
      this.stop()
    }
    this.setState({ state: 'starting' })

    const health = await this.healthCheck(cfg.baseUrl)
    if (!health && cfg.spawn) {
      try {
        this.child = spawn(cfg.spawn.pythonPath, [cfg.spawn.scriptPath], {
          detached: false,
          stdio: ['ignore', 'pipe', 'pipe'],
        })
        this.child.stdout?.on('data', (d) => console.log('[wechat-decrypt stdout]', String(d).trim()))
        this.child.stderr?.on('data', (d) => console.error('[wechat-decrypt stderr]', String(d).trim()))
        this.child.on('error', (err) => {
          console.error('[wechat-decrypt spawn error]', err)
          this.setState({ state: 'error', error: err.message })
        })
        this.child.on('exit', (code) => {
          if (this.running) {
            this.setState({ state: 'error', error: `微信解密服务退出 (code ${code ?? 'unknown'})` })
          }
        })

        let ready = false
        for (let i = 0; i < 20; i++) {
          if (await this.healthCheck(cfg.baseUrl)) {
            ready = true
            break
          }
          await sleep(500)
        }
        if (!ready) {
          this.child.kill()
          this.child = null
          throw new Error('微信解密服务启动后端口未就绪，请检查脚本路径和 Python 环境')
        }
      } catch (err: any) {
        this.setState({ state: 'error', error: err.message })
        throw err
      }
    } else if (!health) {
      this.setState({ state: 'error', error: '无法连接到微信解密服务。请先在外部终端运行 python main.py（需要管理员/root 权限）。' })
      throw new Error(this.state.error)
    }

    this.running = true
    this.setState({ state: 'running', pid: this.child?.pid })
    this.poll(cfg)
  }

  stop() {
    this.running = false
    this.lastTimestamp = 0
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.child) {
      try { this.child.kill() } catch {}
      this.child = null
    }
    this.setState({ state: 'idle' })
  }

  private setState(next: WechatServiceState) {
    this.state = next
    this.emitState()
  }

  private async healthCheck(baseUrl: string): Promise<boolean> {
    return fetchOk(`${baseUrl}/api/history?limit=1`)
  }

  private async poll(cfg: WechatServiceConfig) {
    if (!this.running) return

    try {
      const since = this.lastTimestamp
      const url = `${cfg.baseUrl}/api/history?since=${since}&limit=200`
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) {
        console.error('[wechat] poll non-ok', res.status)
        if (this.running) this.timer = setTimeout(() => this.poll(cfg), cfg.pollIntervalMs)
        return
      }
      const json = (await res.json()) as any
      const msgs: any[] = json.messages ?? json ?? []

      if (msgs.length) {
        const byChat: Record<string, any[]> = {}
        for (const m of msgs) {
          const chat = m.chat ?? m.room ?? m.group ?? m.chat_name ?? ''
          if (!chat || typeof chat !== 'string') continue
          if (!byChat[chat]) byChat[chat] = []
          byChat[chat].push(m)
        }

        for (const [chatName, chatMsgs] of Object.entries(byChat)) {
          const batch = wxToChatMessages(chatName, chatMsgs)
          if (this.win && !this.win.isDestroyed()) {
            this.win.webContents.send('wechat:batch', {
              groupId: createWxGroup(chatName).id,
              groupName: chatName,
              messages: batch,
            })
          }
        }

        const maxTs = Math.max(...msgs.map((m) => Number(m.timestamp ?? m.time ?? 0)))
        if (maxTs > 0) this.lastTimestamp = maxTs
      }
    } catch (err) {
      console.error('[wechat] poll error:', err)
    }

    if (this.running) {
      this.timer = setTimeout(() => this.poll(cfg), cfg.pollIntervalMs)
    }
  }
}
