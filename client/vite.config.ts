import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  return {
    resolve: { tsconfigPaths: true },
    server: {
      watch: {
        ignored: ['**/.netlify/**'],
      },
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        nitro: {
          preset: 'node-server',
        },
      }),
      viteReact(),
    ].filter(Boolean),
  }
})
