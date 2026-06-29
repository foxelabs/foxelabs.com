import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  site: 'https://foxelabs.com',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
