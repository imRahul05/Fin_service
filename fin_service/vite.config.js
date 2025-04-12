// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ui": path.resolve(__dirname, "../src/components/ui"),
      "@hooks": path.resolve(__dirname, "../src/hooks"),
      "@lib": path.resolve(__dirname, "../src/lib")
    },
  },
})
