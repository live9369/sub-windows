/// <reference types="vite/client" />

import type { CssApi } from '../electron/preload'

declare global {
  interface Window {
    cssApi?: CssApi
  }
}

export {}
