// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ui": path.resolve(__dirname, "../src/components/ui"),
      "@hooks": path.resolve(__dirname, "../src/hooks"),
      "@lib": path.resolve(__dirname, "../src/lib")
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group Firebase packages together
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Group Chart.js & react-chartjs-2 together
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            // Group @google/generative-ai
            if (id.includes('@google/generative-ai')) {
              return 'vendor-gemini';
            }
            // Group icons
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Group other node_modules into a general vendor chunk
            return 'vendor-core';
          }
        }
      }
    }
  }
})
