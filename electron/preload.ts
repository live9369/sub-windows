import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  copyText: (text: string) => ipcRenderer.invoke('copy-text', text),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  platform: process.platform,
}

contextBridge.exposeInMainWorld('cssApi', api)

export type CssApi = typeof api
