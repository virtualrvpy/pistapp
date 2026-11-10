import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/pistapp/' : '/',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://vlqlejdssgsuwyqezjtv.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yeOPbOQg6hRaJgdi3xi8Nw_Ve5jDbQa'),
  },
})

