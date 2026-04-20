import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The site is hosted on GitHub Pages at:
//   https://hypn0s-cyber.github.io/home/
//
// If you later rename the repo to `hypn0s-cyber.github.io` (root deployment),
// change `base` to '/' and the `basename` in src/main.tsx to '/'.
const REPO_BASE = '/home/'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return {
    base: REPO_BASE,
    plugins,
  };
})
