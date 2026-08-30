import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  output: 'static',
  site: 'https://foxelabs.com',
  adapter: vercel(),
  integrations: [
    mdx(),
    // Trailing slashes match the canonicals we emit. No lastmod: a build-time
    // stamp marks every URL "changed" on every deploy, which teaches engines
    // to ignore it.
    sitemap({
      changefreq: 'weekly',
      serialize: (item) => ({
        ...item,
        priority: item.url === 'https://foxelabs.com/' ? 1.0
          : item.url.includes('/legal/') ? 0.3
          : 0.7,
      }),
    }),
    icon(),
  ],
  // Open every external link in Markdown/MDX prose in a new tab, safely.
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
    // Light code blocks, matching the Atlassian blog's light wash.
    shikiConfig: { theme: 'github-light' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
