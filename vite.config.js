import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        auth: 'auth.html',
        profile: 'profile.html',
        upload: 'upload.html',
        artwork: 'artwork.html',
        explore: 'explore.html'
      }
    }
  }
})