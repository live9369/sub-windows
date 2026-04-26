import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  copyText: (text: string) => ipcRenderer.invoke('copy-text', text),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  platform: process.platform,

  // Settings persistence
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (v: unknown) => ipcRenderer.invoke('settings:save', v),

  // Wechat service control
  wechatStart: (cfg: unknown) => ipcRenderer.invoke('wechat:start', cfg),
  wechatStop: () => ipcRenderer.invoke('wechat:stop'),
  wechatStatus: () => ipcRenderer.invoke('wechat:status'),

  // Wechat event subscriptions
  onWechatMessage: (cb: (data: { groupId: string; groupName: string; messages: unknown[] }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as any)
    ipcRenderer.on('wechat:batch', handler)
    return () => ipcRenderer.removeListener('wechat:batch', handler)
  },
  onWechatStatusChange: (cb: (state: { state: string; error?: string; pid?: number }) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, data: unknown) => cb(data as any)
    ipcRenderer.on('wechat:status', handler)
    return () => ipcRenderer.removeListener('wechat:status', handler)
  },
}

contextBridge.exposeInMainWorld('cssApi', api)

export type CssApi = typeof api
