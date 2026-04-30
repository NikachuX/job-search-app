import { defineConfig } from 'vite';


export default defineConfig({
  root: '.', 
  server: {
    open: true,     
    port: 3000,     
  },
  base: '/job-search-app/',
});