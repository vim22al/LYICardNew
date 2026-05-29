import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

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
      command === 'build' && netlify(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ].filter(Boolean),
  }
})
