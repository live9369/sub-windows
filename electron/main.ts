import { app, BrowserWindow, shell, ipcMain, clipboard } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { WechatService } from './wechatService'

// vite-plugin-electron emits CJS for main, so `__dirname` is the CJS injected global.
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null
const wechatService = new WechatService()

const settingsPath = () => path.join(app.getPath('userData'), 'app-settings.json')

function loadSettings() {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSettings(data: unknown) {
  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

function createWindow() {
  win = new BrowserWindow({
    title: 'Crypto Side Screen',
    width: 1280,
    height: 1600,
    minWidth: 720,
    minHeight: 900,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  wechatService.attachWindow(win)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

ipcMain.handle('open-external', async (_evt, url: string) => {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    await shell.openExternal(url)
    return true
  }
  return false
})

ipcMain.handle('copy-text', (_evt, text: string) => {
  if (typeof text === 'string') {
    clipboard.writeText(text)
    return true
  }
  return false
})

ipcMain.handle('toggle-fullscreen', () => {
  if (!win) return false
  const next = !win.isFullScreen()
  win.setFullScreen(next)
  return next
})

// Settings persistence
ipcMain.handle('settings:load', () => loadSettings())
ipcMain.handle('settings:save', (_evt, data: unknown) => saveSettings(data))

// Wechat service IPC
ipcMain.handle('wechat:start', async (_evt, cfg: unknown) => {
  await wechatService.start(cfg as any)
  return { ok: true }
})
ipcMain.handle('wechat:stop', () => {
  wechatService.stop()
})
ipcMain.handle('wechat:status', () => {
  return wechatService.getState()
})

app.whenReady().then(() => {
  createWindow()

  // Auto-start wechat service if enabled in saved settings
  const settings = loadSettings()
  if (settings?.wechatEnabled && Array.isArray(settings.wechatGroups?.split)) {
    const groups = String(settings.wechatGroups)
      .split(/[,，]/)
      .map((s: string) => s.trim())
      .filter(Boolean)
    if (groups.length > 0) {
      wechatService
        .start({
          baseUrl: settings.wechatBaseUrl || 'http://localhost:5678',
          groups,
          pollIntervalMs: Number(settings.wechatPollIntervalMs) || 3000,
          spawn:
            settings.wechatPythonPath && settings.wechatScriptPath
              ? {
                  pythonPath: settings.wechatPythonPath,
                  scriptPath: settings.wechatScriptPath,
                }
              : undefined,
        })
        .catch((err) => console.error('[main] auto-start wechat failed:', err))
    }
  }
})

app.on('window-all-closed', () => {
  wechatService.stop()
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
