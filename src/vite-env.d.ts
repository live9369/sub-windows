/// <reference types="vite/client" />

import type { CssApi } from './types/cssApi'

declare global {
  interface Window {
    cssApi?: CssApi
  }
}

export {}
