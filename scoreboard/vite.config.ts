import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // Without this, files outside this tsconfig's include (e.g. Lucide's
  // lang="ts" components in node_modules) fall through to the dashboard's root
  // tsconfig, which extends astro/tsconfigs/strict and isn't installed here.
  tsconfig: './tsconfig.json',
})
