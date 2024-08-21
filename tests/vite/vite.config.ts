import { defineConfig } from 'vite';

export default defineConfig({
  root: 'tests/vite',
  publicDir: 'public',
  build: {
    outDir: './dist',
  },
});
