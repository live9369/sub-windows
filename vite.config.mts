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
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
