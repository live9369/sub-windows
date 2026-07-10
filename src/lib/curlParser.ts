import { proxyExternalUrl } from '@/lib/webProxy'

export function normalizeCurlCommand(input: string): string {
  const normalizedNewline = input.replace(/\r\n/g, '\n').trim()
  const lines = normalizedNewline.split('\n').map((line) => line.trim())
  if (lines.length <= 1) return normalizedNewline
  return lines.map((line) => line.replace(/\\\s*$/, '')).join(' ')
}

export interface ParsedCurlRequest {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

function readQuotedArg(cmd: string, start: number): { value: string; next: number } | null {
  const quote = cmd[start]
  if (quote !== "'" && quote !== '"') return null
  let i = start + 1
  let value = ''
  while (i < cmd.length) {
    const ch = cmd[i]
    if (ch === '\\' && quote === '"') {
      value += cmd[i + 1] ?? ''
      i += 2
      continue
    }
    if (ch === quote) return { value, next: i + 1 }
    value += ch
    i += 1
  }
  return null
}

function nextToken(cmd: string, i: number): { token: string; next: number } {
  while (i < cmd.length && cmd[i] === ' ') i += 1
  if (i >= cmd.length) return { token: '', next: i }

  if (cmd[i] === "'" || cmd[i] === '"') {
    const quoted = readQuotedArg(cmd, i)
    if (!quoted) return { token: '', next: cmd.length }
    return { token: quoted.value, next: quoted.next }
  }

  const start = i
  while (i < cmd.length && cmd[i] !== ' ') i += 1
  return { token: cmd.slice(start, i), next: i }
}

export function parseCurlCommand(input: string): ParsedCurlRequest {
  const cmd = normalizeCurlCommand(input)
  if (!cmd.trimStart().startsWith('curl ')) {
    throw new Error('Only curl command is supported')
  }

  let i = 5
  let url = ''
  const headers: Record<string, string> = {}
  let body: string | undefined
  let method = 'GET'

  while (i < cmd.length) {
    const { token, next } = nextToken(cmd, i)
    i = next
    if (!token) break

    if (token === '-X' || token === '--request') {
      const m = nextToken(cmd, i)
      i = m.next
      method = m.token.toUpperCase() || 'GET'
      continue
    }

    if (token === '-H' || token === '--header') {
      const h = nextToken(cmd, i)
      i = h.next
      const sep = h.token.indexOf(':')
      if (sep > 0) {
        const key = h.token.slice(0, sep).trim()
        const val = h.token.slice(sep + 1).trim()
        headers[key] = val
      }
      continue
    }

    if (token === '-b' || token === '--cookie') {
      const c = nextToken(cmd, i)
      i = c.next
      headers.Cookie = headers.Cookie ? `${headers.Cookie}; ${c.token}` : c.token
      continue
    }

    if (token === '--data-raw' || token === '--data' || token === '-d') {
      const d = nextToken(cmd, i)
      i = d.next
      body = d.token
      method = 'POST'
      continue
    }

    if (!url && (token.startsWith('http://') || token.startsWith('https://'))) {
      url = token
    }
  }

  if (!url) throw new Error('curl 中未找到有效 URL')
  if (!headers['content-type'] && body) headers['content-type'] = 'application/json'

  return { url, method, headers, body }
}

export async function fetchViaParsedCurl(curlCommand: string): Promise<string> {
  const req = parseCurlCommand(curlCommand)
  const fetchUrl = proxyExternalUrl(req.url)
  const res = await fetch(fetchUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: AbortSignal.timeout(20000),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text.slice(0, 500) || `请求失败 (${res.status})`)
  }
  return text
}
