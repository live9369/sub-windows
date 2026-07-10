import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const electronMain = path.resolve(__dirname, 'electron/main.ts')
const electronPreload = path.resolve(__dirname, 'electron/preload.ts')

export default defineConfig(({ mode }) => {
  const enableElectron =
    mode !== 'web' && fs.existsSync(electronMain) && fs.existsSync(electronPreload)

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(enableElectron
        ? [
            electron({
              main: {
                entry: 'electron/main.ts',
                vite: {
                  build: {
                    outDir: 'dist-electron',
                    rollupOptions: {
                      external: ['electron'],
                    },
                  },
                },
              },
              preload: {
                input: path.join(__dirname, 'electron/preload.ts'),
                vite: {
                  build: {
                    outDir: 'dist-electron',
                    rollupOptions: {
                      external: ['electron'],
                    },
                  },
                },
              },
              renderer: {},
            }),
          ]
        : []),
    ],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/__wechat': {
          target: 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__wechat/, ''),
        },
        '/__binance': {
          target: 'https://api.binance.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__binance/, ''),
        },
        '/__binance-bapi': {
          target: 'https://www.binance.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__binance-bapi/, ''),
        },
        '/__blockbeats': {
          target: 'http://api-pro.theblockbeats.info',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__blockbeats/, ''),
        },
        '/__gmgn': {
          target: 'https://openapi.gmgn.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__gmgn/, ''),
        },
      },
    },
    preview: {
      proxy: {
        '/__wechat': {
          target: 'http://localhost:5678',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__wechat/, ''),
        },
        '/__binance': {
          target: 'https://api.binance.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__binance/, ''),
        },
        '/__binance-bapi': {
          target: 'https://www.binance.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__binance-bapi/, ''),
        },
        '/__blockbeats': {
          target: 'http://api-pro.theblockbeats.info',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__blockbeats/, ''),
        },
        '/__gmgn': {
          target: 'https://openapi.gmgn.ai',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/__gmgn/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
