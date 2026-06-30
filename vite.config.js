import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pharmaveer-erp/',
  plugins: [react()],
  build: { outDir: 'dist' }
})
