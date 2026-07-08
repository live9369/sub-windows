export interface WechatBatch {
  groupId: string
  groupName: string
  messages: unknown[]
}

export interface WechatState {
  state: string
  error?: string
  pid?: number
}

export interface TelegramBatch {
  groupId: string
  groupName: string
  messages: unknown[]
}

export interface TelegramState {
  state: string
  error?: string
}

export interface TwitterState {
  state: string
  error?: string
}

export interface CssApi {
  openExternal: (url: string) => Promise<boolean>
  copyText: (text: string) => Promise<boolean>
  toggleFullscreen: () => Promise<boolean>
  platform: string

  loadSettings: () => Promise<unknown>
  saveSettings: (v: unknown) => Promise<boolean>

  wechatStart: (cfg: unknown) => Promise<any>
  wechatStop: () => Promise<any>
  wechatStatus: () => Promise<WechatState>
  wechatDiscover: (baseUrl: string) => Promise<string[]>
  onWechatMessage: (cb: (data: WechatBatch) => void) => () => any
  onWechatStatusChange: (cb: (state: WechatState) => void) => () => any

  telegramConnect: (apiId: number, apiHash: string) => Promise<TelegramState>
  telegramLogin: (phone: string) => Promise<TelegramState>
  telegramSubmitCode: (code: string) => Promise<TelegramState>
  telegramSubmitPassword: (password: string) => Promise<TelegramState>
  telegramGetDialogs: () => Promise<any[]>
  telegramLoadHistory: (chatId: string, limit?: number, offsetId?: number) => Promise<any[]>
  telegramDisconnect: () => Promise<TelegramState>
  telegramStatus: () => Promise<TelegramState>
  onTelegramMessage: (cb: (data: TelegramBatch) => void) => () => any
  onTelegramStatusChange: (cb: (state: TelegramState) => void) => () => any
  onTelegramNeedCode: (cb: () => void) => () => any
  onTelegramNeedPassword: (cb: () => void) => () => any

  blockbeatsFetch: (apiKey: string, page?: number, size?: number) => Promise<string>

  gmgnTokenInfo: (chain: string, address: string, apiKey?: string) => Promise<unknown>

  twitterStart: (cfg: unknown) => Promise<any>
  twitterStop: () => Promise<any>
  twitterStatus: () => Promise<TwitterState>
  onTwitterTweet: (cb: (item: unknown) => void) => () => any
  onTwitterStatusChange: (cb: (state: TwitterState) => void) => () => any
}
