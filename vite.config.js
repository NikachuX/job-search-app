import { defineConfig } from 'vite'

export default defineConfig({
  base: '/job-search-app/',
  server: {
    open: true,
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        profile: 'profile.html',
      }
    }
  }
})