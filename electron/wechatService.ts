import { spawn, type ChildProcess } from 'node:child_process'
import type { BrowserWindow } from 'electron'
import { createWxGroup, wxToChatMessages } from '../src/lib/wechatAdapter'
import type { MonitoredGroup } from '../src/types'

export interface WechatServiceConfig {
  baseUrl: string
  groups: string[]
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
  private lastTimestamps: Record<string, number> = {}
  private win: BrowserWindow | null = null
  private groups: string[] = []

  attachWindow(win: BrowserWindow) {
    this.win = win
  }

  getState(): WechatServiceState {
    return { ...this.state }
  }

  private emitState() {
    this.win?.webContents.send('wechat:status', this.state)
  }

  async start(cfg: WechatServiceConfig) {
    if (this.running) {
      this.stop()
    }
    this.groups = cfg.groups
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

        // 等待端口就绪（最长 10 秒）
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

    for (const name of cfg.groups) {
      try {
        const since = this.lastTimestamps[name] ?? 0
        const url = `${cfg.baseUrl}/api/history?chat=${encodeURIComponent(name)}&since=${since}&limit=200`
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
        if (!res.ok) continue
        const json = await res.json() as any
        const msgs: any[] = json.messages ?? json ?? []
        if (msgs.length) {
          const batch = wxToChatMessages(name, msgs)
          this.win?.webContents.send('wechat:batch', {
            groupId: createWxGroup(name).id,
            groupName: name,
            messages: batch,
          })
          const maxTs = Math.max(...msgs.map((m) => Number(m.timestamp ?? m.time ?? 0)))
          if (maxTs > 0) this.lastTimestamps[name] = maxTs
        }
      } catch (err) {
        // 单群轮询失败不中断整体服务
        console.error(`[wechat] poll error for ${name}:`, err)
      }
    }

    if (this.running) {
      this.timer = setTimeout(() => this.poll(cfg), cfg.pollIntervalMs)
    }
  }
}
