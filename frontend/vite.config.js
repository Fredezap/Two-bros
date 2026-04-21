import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/twobros/',   // 👈 ESTE es el cambio clave
  preview: {
    allowedHosts: ["localhost", "127.0.0.1", "futsalforher.ch"],
  },
})