/// <reference types="vite/client" />

import type { CssApi } from './types/cssApi'

declare global {
  interface Window {
    cssApi?: CssApi
  }
}

declare module '*.md?raw' {
  const content: string
  export default content
}

export {}
